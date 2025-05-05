package tic

import scala.util.parsing.combinator.RegexParsers
import org.apache.spark.sql.SparkSession
import scopt._
import tic.Utils._
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._
import org.apache.spark.sql._
import java.util.Properties
import scala.collection.mutable.Map

sealed trait AST
case object N_A extends AST
case class Field(a:String) extends AST
case class ExtractFirstName(a:AST) extends AST
case class ExtractLastName(a:AST) extends AST
case class GenerateID(a:Seq[AST]) extends AST
case class If(a:AST,b:AST,c:AST) extends AST
case class Infix(a:AST,b:String,c:AST) extends AST
case class Lit(a:String) extends AST

object DSL {

  object NameParser extends RegexParsers {
    override def skipWhitespace = false

    def name0 : Parser[String] = {
      "[a-zA-Z]+[a-z]+".r
    }

    def name : Parser[String] = {
      name0 ~ ("-" ~ name0).? ^^ {
        case a ~ None => a
        case a ~ Some(b ~ c) => a + b + c
      }
    }

    def initial : Parser[String] = {
      "[a-zA-Z]\\.?".r
    }

    def first_name : Parser[String] = {
      initial ||| name
    }

    def middle_name : Parser[String] = {
      "(" ~> name <~ ")" | (initial ||| name)
    }

    def last_name : Parser[String] = {
      name
    }

    def title0 : Parser[String] = {
      "MD" |
      "M.D." |
      "PhD" |
      "MPH" |
      "MBBCH" |
      "MSCE"
    }

    def title : Parser[String] = {
      ",".? ~> " " ~> title0
    }

    def fml : Parser[Seq[String]] = {
      first_name ~ ((" " ~> middle_name) ~> (" " ~> last_name)) ^^ {
          case a ~ b => Seq(a, b)
      }
    }

    def fl : Parser[Seq[String]] = {
      first_name ~ (" " ~> last_name) ^^ {
        case a ~ b => Seq(a, b)
      }
    }

    def lf : Parser[Seq[String]] = {
      last_name ~ (", " ~> first_name) ^^ {
        case a ~ b => Seq(b, a)
      }
    }

    def l : Parser[Seq[String]] = {
      last_name ^^ {
        a => Seq(null, a)
      }
    }

    def pi_name0 : Parser[Seq[String]] = {
      "Dr." ~> " " ~> pi_name0 | (fml ||| fl ||| lf ||| l) <~ title.* <~ " ".?
    }

    def pi_name : Parser[Seq[String]] = {
      "unknown" ^^ { _ => Seq("unknown", "unknown") } |
      "Pending" ^^ { _ => Seq("Pending", "Pending") } |
      pi_name0
    }

    def apply(input: String): Seq[String] =
      if(input == null) {
        Seq(null, null)
      }
      else {
        parseAll(pi_name, input) match {
          case Success(result, _) => result
          case failure: NoSuccess =>
            println("error parsing pi name " + input + ", " + failure.msg)
            def parse2(input2: String) =
              parseAll(pi_name, input2) match {
                case Success(result, _) => result
                case failure: NoSuccess =>
                  println("error parsing pi name for special cases " + input + ", " + failure.msg)
                  Seq(null, input)
              }

            if (input.contains('-')) {
              parse2(input.split("-")(1).trim)
                
            } else if (input.contains(',')) {
              parse2(input.split(",")(0).trim)
            } else if (input.contains('/')) {
              parse2(input.split("/")(0).trim)
            } else if (input.contains("for")) {
              parse2(input.split("for")(0).trim)
            } else {
              println("cannot parse pi name for special cases " + input + ", " + failure.msg)
              Seq(null, input)
            }
        }
      }

    def isWellFormedFirstName(input: String) : Boolean =
      parseAll(first_name, input) match {
        case Success(result, _) => true
        case failure: NoSuccess =>
          println(failure)
          false
      }

    def isWellFormedLastName(input: String) : Boolean =
      parseAll(last_name, input) match {
        case Success(result, _) => true
        case failure: NoSuccess =>
          println(failure)
          false
      }

  }

  val parseName = udf(NameParser.apply _)


  case class Choice(index: String, description: String)
  object MetadataParser extends RegexParsers {
    def choice : Parser[Choice] = {
      "[0-9_]+".r ~ (", " ~> "([^|])*".r) ^^ {
        case a ~ b =>
          Choice(a, b.trim)
      }
    }

    def choices : Parser[Seq[Choice]] = {
      repsep(choice, "| ")
    }
    def apply(input: String): Option[Seq[Choice]] =
      parseAll(choices, input) match {
        case Success(result, _) => Some(result)
        case failure: NoSuccess =>
          println("error parsing choices " + input + ", " + failure.msg)
          None
      }
  }

  object DSLParser extends RegexParsers {

    def n_a : Parser[AST] = {
      "n/a" ^^ { _ => N_A}
    }

    def field: Parser[AST] = {
      "[a-zA-Z_][a-zA-Z0-9_]*".r ^^ { str => Field(str) }
    }

    def string: Parser[String] = 
      """"[^"]*"""".r ^^ { str =>
        val content = str.substring(1, str.length - 1)
        content
      }

    def value: Parser[AST] = {
      "(" ~> term <~ ")" |
      "extract_first_name" ~ value ^^ {
        case _ ~ field =>
          ExtractFirstName(field)
      } |
      "extract_last_name" ~ value ^^ {
        case _ ~ field =>
          ExtractLastName(field)
      } |
      "generate_ID" ~ ("(" ~> repsep(value, ",") <~ ")") ^^ {
        case _ ~ fields =>
          GenerateID(fields)
      } |
      "if" ~ term ~ "then" ~ term ~ "else" ~ term ^^ {
        case _ ~ c ~ _ ~ t ~ _ ~ e => If(c ,t, e)
      } |
      string ^^ Lit |
      field
    }

    def term: Parser[AST] = {
      value ~ rep(("/"|"=") ~ term) ^^ {
        case field ~ list =>
          list.foldLeft(field) {
            case (a, op ~ b) => Infix(a, op, b)
          }
      }
    }

    def expr : Parser[AST] = {
      n_a | term
    }

    def apply(input: String): AST = parseAll(expr, input) match {
      case Success(result, _) => result
      case failure: NoSuccess => scala.sys.error(failure.msg)
    }

    def eval(df: DataFrame, col: String, ast: AST): Column =
      ast match {
        case N_A => scala.sys.error("n/a")
        case Field(a) => df.col(a)
        case ExtractFirstName(a) =>
          parseName(eval(df, col, a)).getItem(0)
        case ExtractLastName(a) =>
          parseName(eval(df, col, a)).getItem(1)
        case Infix(a, "/", b) =>
          when(eval(df, col, a).isNull || eval(df, col, a) === lit(""), eval(df, col, b)).otherwise(eval(df, col, a))
        case Infix(a, "=", b) =>
          eval(df, col, a) === eval(df, col, b)
        case Infix(a, op, b) => scala.sys.error(f"unsupported operator {op}")
        case Lit(a) =>
          lit(a)
        case If(a, b, c) =>
          when(eval(df, col, a), eval(df, col, b)).otherwise(eval(df, col, c))
        case GenerateID(_) =>
          df.col(col)
      }

    def fields(ast: AST): Seq[String] =
      ast match {
        case N_A => Seq()
        case Field(a) => Seq(a)
        case ExtractFirstName(a) =>
          fields(a)
        case ExtractLastName(a) =>
          fields(a)
        case Infix(a, _, b) =>
          fields(a).union(fields(b))
        case Lit(_) =>
          Seq()
        case If(a, b, c) =>
          fields(a).union(fields(b)).union(fields(c))
        case GenerateID(as) =>
          as.map(fields).reduce(_ union _)
      }

  }

}

