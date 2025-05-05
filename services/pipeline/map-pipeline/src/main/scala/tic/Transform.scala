package tic
import org.apache.spark.sql.SparkSession
import org.apache.spark.storage.StorageLevel
import scopt._
import tic.Utils._
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._
import org.apache.spark.sql._
import java.util.Properties
import scala.collection.mutable.Map
import scala.concurrent.Future
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.concurrent.ExecutionContext.Implicits.global
import java.io.File
import java.util.logging.Logger
import java.util.logging.Level
import java.util.logging.ConsoleHandler
import scala.collection.JavaConverters._
import tic.DSL._
import tic.GetData.getData
import tic.GetDataDict.getDataDict

case class Config2(
  mappingInputFile:String = "",
  dataInputFile:String="",
  dataDictInputFile:String="",
  auxiliaryDir:String="",
  filterDir:String="",
  blocklistDir:String="",
  outputDir:String="",
  verbose:Boolean=false
)

object DataFilter {
  import Transform._
  type SourceDataFilter = DataFrame => (DataFrame, Option[DataFrame])

  def to_string(ti: String, df: DataFrame) = Tabulator.format(ti, df.columns.toSeq, df.collect().map((row) => row.toSeq))

  def to_string_seq[A](s: Seq[A]) = s.mkString("\n")

  def comp(a : SourceDataFilter, b : SourceDataFilter) : SourceDataFilter = df => {
    val (df1, nd1) = a(df)
    val (df2, nd2) = b(df1)
    (df2, nd2 match {
      case None => nd1
      case _ => nd2
    })
  }

  val id : SourceDataFilter = df => (df, None)

  val testDataFilter : Boolean => SourceDataFilter = (verbose: Boolean) => (data : DataFrame) => {
    logger.info("filtering data 2")
    val filterProposal = udf(
      (pid: String, title : String, short_name: String, pi_firstname : String, pi_lastname : String) =>
      if (title == "") {
        logger.info(s"$pid is filtered because title is empty")
        true
      } else if (!title.contains(' ')) {
        logger.info(s"$pid is filtered because title doesn't contains a space")
        true
      } else if ((pi_firstname != "" && !NameParser.isWellFormedFirstName(pi_firstname.head +: pi_firstname.tail.toLowerCase)) &&
        (pi_lastname != "" && !NameParser.isWellFormedLastName(pi_lastname.head +: pi_lastname.tail.toLowerCase))) {
        logger.info(s"$pid is filterd because both pi_firstname [$pi_firstname] and pi_lastname [$pi_lastname] are nonempty and not well-formed")
        true
      } else {
        false
      }
    )

    val f = filterProposal(data.col("proposal_id"), data.col("proposal_title2"), data.col("short_name"), data.col("pi_firstname"), data.col("pi_lastname"))
    val negdata = data.filter(f)

    val data2 = data.filter(!f)
    if(verbose)
      logger.info(data.count + " rows remaining")
    logger.info("\n" + to_string("non test data", data2.select("proposal_id", "redcap_repeat_instance", "redcap_repeat_instrument", "heal_study")))
    logger.info("\n" + to_string("test data", negdata.select("proposal_id", "redcap_repeat_instance", "redcap_repeat_instrument", "heal_study")))
    data2.persist(StorageLevel.MEMORY_AND_DISK)
    (data2, Some(negdata))
  }

  val filter1 : Boolean => SourceDataFilter = (verbose: Boolean) => (data : DataFrame) => {
    logger.info("filtering data")
    val data2 = data.filter(data.col("redcap_repeat_instrument") === "" && data.col("redcap_repeat_instance").isNull)
    if(verbose)
      logger.info(data2.count + " rows remaining")
    logger.info("\n" + to_string("current data", data2.select("proposal_id", "redcap_repeat_instance", "redcap_repeat_instrument", "heal_study")))
    data2.persist(StorageLevel.MEMORY_AND_DISK)
    (data2, None)
  }

  val auxDataFilter : (SparkSession, String, String) => SourceDataFilter = (spark, auxiliaryDir, joinType) => (data : DataFrame) => {
    val dataMappingDfs = new File(auxiliaryDir).listFiles.toSeq.map((f) => {
      logger.info("loading aux " + f.getAbsolutePath())
      spark.read.format("csv").option("header", true).option("mode", "FAILFAST").load(f.getAbsolutePath())
    })

    var data2 = data
    dataMappingDfs.foreach (df => {
      val columns = df.columns.intersect(data2.columns)
      logger.info("joining dataframes")
      logger.info("data: " + to_string_seq(data.columns.toSeq))
      logger.info("aux: " + to_string_seq(df.columns.toSeq))
      logger.info("on " + to_string_seq(columns))
      logger.info("join type: " + joinType)
      data2 = data2.join(df, columns, joinType)
      logger.info("\n" + to_string(s"data $joinType join aux", data2.select("proposal_id", "redcap_repeat_instance", "redcap_repeat_instrument", "heal_study")))
    })
    data2.persist(StorageLevel.MEMORY_AND_DISK)
    (data2, None)
  }

  val blockDataFilter : (SparkSession, String) => SourceDataFilter = (spark, blocklistDir) => (data : DataFrame) => {
    logger.info("loading blocklists from dir " + blocklistDir)
    val dataMappingDfs = new File(blocklistDir).listFiles.toSeq.map((f) => {
      logger.info("loading blocklist " + f.getAbsolutePath())
      spark.read.format("csv").option("header", true).option("mode", "FAILFAST").load(f.getAbsolutePath())
    })

    var data2 = data
    dataMappingDfs.foreach (df => {
      val joinColumns = df.columns
      logger.info("joining dataframes")
      logger.info("data columns: " + to_string_seq(data.columns.toSeq))
      logger.info("blocklist columns: " + to_string_seq(df.columns.toSeq))
      logger.info("on " + to_string_seq(joinColumns.toSeq))
      var i = 0
      var col = "_block"
      val columnSet = df.columns.toSet.union(data.columns.toSet)
      while (columnSet.contains(col)) {
        i+=1
        col = "_block" + i
      } 
      val df2 = df.withColumn(col, lit(true))
      logger.info("\n" + to_string("blocklist df", df2))
      val joinCondition = joinColumns.map(a => data2.col(a) <=> df2.col(a)).reduceOption((a, b) => a && b)
      joinCondition match {
        case Some(joinCondition) =>
          data2 = data2.join(df2, joinCondition, "left")
        case _ =>
      }
      for (joinColumn <- joinColumns)
        data2 = data2.drop(df2(joinColumn))
      logger.info("\n" + to_string("data left join blocklist df", data2.select("proposal_id", ("redcap_repeat_instance" +: "redcap_repeat_instrument" +: "heal_study" +: joinColumns :+ col): _*)))
      data2 = data2.filter(data2.col(col).isNull).drop(col)
      logger.info("\n" + to_string("data filtered by blocklist", data2.select("proposal_id", ("redcap_repeat_instance" +: "redcap_repeat_instrument" +: "heal_study" +: joinColumns): _*)))
    })
    data2.persist(StorageLevel.MEMORY_AND_DISK)
    (data2, None)
  }

}

// https://stackoverflow.com/questions/7539831/scala-draw-table-to-console
object Tabulator {
  def dim(s: Seq[String]): (Int, Int) = (if (s.isEmpty) 0 else s.map(_.length).max, s.size)

  def wrapText(s : String): Seq[String] = s.grouped(26).toSeq
  def spacify(s: Any) : Seq[String] = if (s == null) Seq() else s.toString.split("\n").map(_.replace("\r", "").replace("\t", "    ")).flatMap(wrapText)

  def format(title0:Any, header0 : Seq[Any], rows0: Seq[Seq[Any]]) = {
    val title = spacify(title0)
    val header = header0.map(spacify)
    val rows = rows0.map(_.map(spacify))
    val table = header +: rows

    val sizes = for (row <- table) yield for (cell <- row) yield dim(cell)

    val colSizes = for (col <- sizes.transpose) yield if (col.isEmpty) 0 else col.map(_._1).max
    val rowSizes = for (row <- sizes) yield if (row.isEmpty) 0 else row.map(_._2).max
    val titleSize = dim(title)
    val tableWidth = Math.max(colSizes.sum, titleSize._1)
    val pad = Math.max(0, tableWidth - colSizes.sum)
    val pad1 = pad.toFloat / colSizes.size
    val colSizesPad = colSizes.zipWithIndex.map {
      case (colSize, i) => colSize + Math.round(Math.ceil(pad1 * i)).toInt
    }
    val rowsFormatted = for ((row, rowSize) <- rows zip rowSizes.tail) yield formatRow(row, rowSize, colSizesPad)
    val headerFormatted = formatRow(header, rowSizes.head, colSizesPad)
    val titleFormatted = formatRow(Seq(title), titleSize._2, Seq(colSizesPad.sum + (colSizesPad.size - 1)))
    formatRows(rowSeparator(colSizesPad), titleFormatted, headerFormatted, rowsFormatted)
  }

  def formatRows(rowSeparator: String, title : String, header : String, rows: Seq[String]): String = (
    (
      rowSeparator +:
      title +:
      rowSeparator +: 
      header +:
      rowSeparator +:
      (if (rows.isEmpty) Seq() else rows.tail.foldLeft(Seq[String](rows.head))((l,v)=> l :+ rowSeparator :+ v)) :+ rowSeparator)).mkString("\n")

  def formatRow(row: Seq[Seq[String]], rowSize: Int, colSizes: Seq[Int]) =
    (for (
      line <- row.map(cell => cell ++ Seq.fill(rowSize - cell.size)("")).transpose
    ) yield (for (
      (item, size) <- line zip colSizes
    ) yield if (size == 0) "" else ("%-" + size + "s").format(item)).mkString("|", "|", "|")).mkString("\n")

  def rowSeparator(colSizes: Seq[Int]) = colSizes map { "-" * _ } mkString("+", "+", "+")
}

import DataFilter._
object Transform {
  val logger = Logger.getLogger(this.getClass().getName())
  logger.setLevel(Level.FINEST)

  val ch = new ConsoleHandler()
  logger.addHandler(ch)
  ch.setLevel(Level.FINEST)
  // use OParser class in scopt package to parse input argument typed by Config2 class
  val builder = OParser.builder[Config2]
  val parser =  {
    import builder._
    OParser.sequence(
      programName("Transform"),
      head("Transform", "0.2.2"),
      opt[String]("mapping_input_file").required().action((x, c) => c.copy(mappingInputFile = x)),
      opt[String]("data_input_file").required().action((x, c) => c.copy(dataInputFile = x)),
      opt[String]("data_dictionary_input_file").required().action((x, c) => c.copy(dataDictInputFile = x)),
      opt[String]("auxiliary_dir").required().action((x, c) => c.copy(auxiliaryDir = x)),
      opt[String]("filter_dir").required().action((x, c) => c.copy(filterDir = x)),
      opt[String]("block_dir").required().action((x, c) => c.copy(blocklistDir = x)),
      opt[String]("output_dir").required().action((x, c) => c.copy(outputDir = x)),
      opt[Unit]("verbose").action((_, c) => c.copy(verbose = true)))
  }

  def convert(fieldType: String) : DataType =
    fieldType match {
      case "boolean" => BooleanType
      case "int" => IntegerType
      case "date" => DateType
      case "text" => StringType
      case _ => throw new RuntimeException("unsupported type " + fieldType)
    }

  def convertType(col : String, fieldType : String, data : DataFrame) : DataFrame =
    data.withColumn("tmp", data.col(col).cast( convert(fieldType))).drop(col).withColumnRenamed("tmp", col)

  def primaryKeyMap(spark : SparkSession, mapping : DataFrame) : scala.collection.immutable.Map[String, Seq[(String, String, String)]] = {
    import spark.implicits._
    val pkMap = mapping
      .filter($"Primary" === "yes")
      .groupBy("Table_CTMD")
      .agg(collect_list(struct("Fieldname_redcap", "Fieldname_CTMD", "Data Type")).as("primaryKeys"))
      .map(r => (r.getString(0), r.getSeq[Row](1).map(x => (x.getString(0), x.getString(1), x.getString(2)))))
      .collect()
      .toMap

    logger.info("pkMap = " + pkMap)
    pkMap
  }

  def allStringTypeSchema(spark: SparkSession, config : Config2, mapping: DataFrame): StructType = {
    val data0 = spark.read.format("json").option("multiline", true).option("mode", "FAILFAST").load(config.dataInputFile)
    val data0Cols = data0.columns
    StructType(data0Cols.map(x => {
      StructField(x, StringType, true)
    }))
  }

  def readData(spark : SparkSession, config: Config2, mapping: DataFrame): (DataFrame, DataFrame) = {
    import spark.implicits._
    val schema = allStringTypeSchema(spark, config, mapping)
    logger.info("reading data")
    var data = spark.read.format("json").option("multiline", true).option("mode", "FAILFAST").schema(schema).load(config.dataInputFile)
    if(config.verbose)
      logger.info(data.count + " rows read")

    // =!= is inequality test in spark.sql.Column
    // toSeq() returns a sequence ArrayBuffer from the Scala map
    // +: prepend a single element to the ArrayBuffer
    val datatypes = ("redcap_repeat_instrument", "text") +: ("redcap_repeat_instance", "int") +: mapping.select("Fieldname_redcap", "Data Type").filter($"Fieldname_redcap" =!= "n/a").distinct.map(r => (r.getString(0), r.getString(1))).collect.toSeq
    val dataCols = data.columns.toSeq
    for(datatype <- datatypes) {
      val col = datatype._1
      val colType = datatype._2
      if (dataCols.contains(col))
        data = convertType(col, colType, data)
    }

    // val dataColsExceptProposalID = dataCols.filter(x => x != "proposal_id")
    // val dataColsExceptKnownRepeatedFields = dataCols.filter(x => !Seq("proposal_id", "redcap_repeat_instrument", "redcap_repeat_instance").contains(x))
    // var i = 0
    // val n = dataColsExceptKnownRepeatedFields.size
    // val redundantData = dataColsExceptKnownRepeatedFields.flatMap(x => {
    //   logger.info("looking for repeat data in " + x + " " + i + "/" + n)
    //   i += 1
    //   val dataValueCountByProposalID = data.select("proposal_id", x).filter(col(x) !== "").groupBy("proposal_id").agg(collect_set(col(x)).as(x + "_set"))
    //   val y = dataValueCountByProposalID.filter(size(col(x + "_set")) > 1).map(r => (r.getString(0),r.getSeq[String](1))).collect
    //   logger.info(y.mkString("\n"))
    //   if(y.nonEmpty) {
    //     Seq(y.map(y => (x, y._1, y._2)))
    //   } else {
    //     Seq()
    //   }
    // }).toDF("proposal_id", "column", "value")
    // writeDataframe(hc, config.outputDir + "/redundant", redundantData, header = true)

    data = data.withColumn("pi_firstname", trim(data.col("pi_firstname")))
    data = data.withColumn("pi_lastname", trim(data.col("pi_lastname")))
    val (data2, negdata) =
      comp(
        comp(
          comp(
            filter1(config.verbose),
            if(config.auxiliaryDir == "") id else auxDataFilter(spark, config.auxiliaryDir, "left")
          ), if(config.filterDir == "") id else auxDataFilter(spark, config.filterDir, "inner")
        ), if(config.blocklistDir == "") id else blockDataFilter(spark, config.blocklistDir)
      )(data)

    (data2, negdata.getOrElse(null))
  }

  /**
    * generate id columns in data. 
    */
  def generateID(spark : SparkSession, config : Config2, mapping : DataFrame, data0 : DataFrame): DataFrame = {
    import spark.implicits._
    var data = data0
    val generateIDCols = mapping.select("Fieldname_CTMD", "Fieldname_redcap").distinct.collect.flatMap(x => {
      val ast = DSLParser(x.getString(1))
      ast match {
        case GenerateID(as) => Some((x.getString(0), as))
        case _ => None
      }
    }).toSeq

    generateIDCols.foreach {
      case (col, as) =>
        logger.info("generating ID for column " + col)
        val cols2 = as.zip((0 until as.size).map("col" + _))
        // evaluate asts and for each ast and add a new column to data
        cols2.foreach {
          case (ast, col2) =>
            data = data.withColumn(col2, DSLParser.eval(data, col2, ast))
        }
        logger.info("select columns " + as)
        // select distinct values in the added columns and generate an id
        val df2 = data.select(cols2.map({case (_, col2) => data.col(col2)}) : _*).distinct.withColumn(col, monotonically_increasing_id)
        // join data with id
        data = data.join(df2, cols2.map({case (_, col2) => col2}), "left")
        // remove columns
        cols2.foreach {
          case (_, col2) =>
            data = data.drop(col2)
        }
        if(config.verbose)
          logger.info(data.count + " rows remaining")
    }
    data
  }

  def diff(spark : SparkSession, mapping : DataFrame, dataCols2 : Seq[String]) : (DataFrame, DataFrame) = {
    import spark.implicits._
    val mappingCols = mapping.select("Fieldname_redcap").distinct.map(x => DSLParser.fields(DSLParser(x.getString(0)))).collect().toSeq.flatten
    val unknown = dataCols2.diff(mappingCols).toDF("column")
    val missing = mappingCols.diff(dataCols2).toDF("colums")
    (unknown, missing)
  }


  def copy(spark: SparkSession, config: Config2, tableMap : Map[String, DataFrame], mapping : DataFrame, data: DataFrame) : Seq[String] = {
    import spark.implicits._
    // filter out columns that contain ___ which indicates many to many relationship
    def copyFilter(s:String) : Option[String] =
      s.indexOf("___") match {
        case -1 =>
          Some(s)
        case i =>
          None
      }
    val dataCols = data.columns.toSeq
    val columnsToCopy = dataCols.flatMap(copyFilter) // these are the columns that will be one to one or many to one

    // we assume that a dsl term doesn't contain both copy columns and pivot columns. therefore if a fieldName_phase1 term contains a copy column then we process it here.
    val containsColumnToCopy = udf((fieldName_phase1 : String) => DSLParser.fields(DSLParser(fieldName_phase1)).intersect(columnsToCopy).nonEmpty)

    // columns to copy
    val columnToCopyTables = mapping
      .filter(containsColumnToCopy($"Fieldname_redcap")) // find dsl terms that contains copy columns. our assumption is that they must contain only copy columns.
      .filter($"Table_CTMD".isNotNull)
      .groupBy("Table_CTMD")
      .agg(collect_list(struct("Fieldname_redcap", "Fieldname_CTMD")).as("columns"))

    logger.info("copy " + columnToCopyTables.select("Table_CTMD").collect().mkString(","))
    val columnToCopyTablesMap = columnToCopyTables.collect.map(r => (r.getString(r.fieldIndex("Table_CTMD")), Option(r.getSeq[Row](r.fieldIndex("columns")).map(x => (x.getString(0), x.getString(1)))).getOrElse(Seq())))

    def extractColumnToCopyTable(columns: Seq[(String, String)]) =
      data.select( columns.map {
        case (fieldname_phase1, fieldname_HEAL) =>
          DSLParser.eval(data, fieldname_HEAL, DSLParser(fieldname_phase1)).as(fieldname_HEAL)
      } : _*).distinct()

    columnToCopyTablesMap.foreach {
      case (table, columnsToCopy) =>
        logger.info("processing column to copy table " + table)
        logger.info("copy columns " + columnsToCopy.mkString("[", ",", "]"))
        val df = extractColumnToCopyTable(columnsToCopy)
        if(config.verbose)
          logger.info(df.count + " rows copied")
        tableMap(table) = df
    }
    columnsToCopy

  }

  def collect(spark: SparkSession, config: Config2, tableMap : Map[String, DataFrame], mapping : DataFrame, data : DataFrame):Seq[String] = {
    import spark.implicits._
    val pkMap = primaryKeyMap(spark, mapping)
    val dataCols = data.columns.toSeq
    def unpivotFilter(s:String) : Option[(String, String)] =
      s.indexOf("___") match {
        case -1 =>
          None
        case i =>
          Some((s, s.substring(0, i)))
      }


    val unpivotMap = dataCols.flatMap(unpivotFilter)
    val unpivotColumnToColumnsMap = unpivotMap.groupBy(_._2).mapValues(_.map(_._1))

    val columnsToUnpivot = unpivotMap.map(_._2).distinct

    // we assume that a dsl term doesn't contain both copy columns and pivot columns. therefore if a fieldName_phase1 term contains a copy column then we process it here.
    val containsColumnToUnpivot = udf((fieldName_phase1 : String) => DSLParser.fields(DSLParser(fieldName_phase1)).intersect(columnsToUnpivot).nonEmpty)

    // columns to unpivot
    val columnToUnpivotTables = mapping
      .filter(containsColumnToUnpivot($"Fieldname_redcap"))
      .filter($"Table_CTMD".isNotNull)
      .select("Table_CTMD", "Fieldname_CTMD", "Fieldname_redcap", "Data Type")
      .distinct

    logger.info("unpivot " + columnToUnpivotTables.select("Table_CTMD","Fieldname_CTMD").collect().mkString(","))

    val columnToUnpivotTablesMap = columnToUnpivotTables.collect
      .map(r => (r.getString(r.fieldIndex("Table_CTMD")), r.getString(r.fieldIndex("Fieldname_redcap")), r.getString(r.fieldIndex("Fieldname_CTMD")), r.getString(r.fieldIndex("Data Type"))))

    // ensure that we don't have more than one many to many relationship in each table being mapped to
    val columnToUnpivotToSeparateTableTables = columnToUnpivotTables.groupBy("Table_CTMD").agg(count("Fieldname_CTMD").as("count"))
      .filter($"count" > 1).select("Table_CTMD").map(r => r.getString(0)).collect()

    columnToUnpivotToSeparateTableTables.foreach(r => logger.info(r + " has > 1 unpivot fields"))

    assert(columnToUnpivotToSeparateTableTables.isEmpty)

    def extractColumnToUnpivotTable(primaryKeys: Seq[(String,String,String)], column2: String, column2Type: String, unpivots: Seq[String]) = {
      val df = data.select((primaryKeys.map(_._1) ++ unpivots).map(data.col _) : _*).distinct()
      logger.info("processing unpivot " + column2 + " from " + unpivots.mkString("[",",","]"))

      // find selected items
      def toDense(selections : Seq[Any]) : Seq[Any] =
        unpivots.zip(selections).filter{
          case (_, selection) => selection == "1" || selection == 1
        }.map(_._1)

      val schema = StructType(
        primaryKeys.map{
          case (_, prikeyHeal, dataType) => StructField(prikeyHeal, convert(dataType), true)
        } :+ StructField(column2, convert(column2Type), true)
      )

      spark.createDataFrame(df.rdd.flatMap(r => {
        val prikeyvals = primaryKeys.map(_._1).map(prikey => r.get(r.fieldIndex(prikey)))
        val unpivotvals = unpivots.map {
          fieldname_phase1 => r.get(r.fieldIndex(fieldname_phase1))
        }
        val dense = toDense(unpivotvals)
        dense.map(selection =>
          Row.fromSeq(primaryKeys.map(key => r.get(r.fieldIndex(key._1))) :+ selection))
      }), schema)

    }

    columnToUnpivotTablesMap.foreach {
      case (table, column0, column2, column2Type) =>
        val file = s"${config.outputDir}/tables/${table}"
        val columnsToUnpivot = unpivotColumnToColumnsMap(column0)
        logger.info("processing column to unpivot table " + table + ", column " + column2)
        logger.info("unpivoting columns " + columnsToUnpivot.mkString("[", ",", "]"))
        val pks = pkMap(table).filter(x => x._1 != "n/a" && x._1 != column0)
        val df = extractColumnToUnpivotTable(pks, column2, column2Type, columnsToUnpivot)
        val df2 = df.join(tableMap(table), pks.map(_._2))
        if(config.verbose)
          logger.info("joining " + tableMap(table).count() + " rows to " + df.count() + " rows on " + pks + ". The result has " + df2.count() + " rows ")
        tableMap(table) = df2
    }
    columnsToUnpivot
  }

  def main(args : Array[String]) {
    // entry point of transform class
    OParser.parse(parser, args, Config2()) match {
      case Some(config) =>
        val spark = SparkSession.builder.appName("Transform").getOrCreate()
        spark.sparkContext.setLogLevel("WARN")

        val hc = spark.sparkContext.hadoopConfiguration

        import spark.implicits._

        val mapping = spark.read.format("json").option("multiline", true).option("mode", "FAILFAST").load(config.mappingInputFile).filter($"InitializeField" === "yes").select($"Fieldname_CTMD", $"Fieldname_redcap", $"Data Type", $"Table_CTMD", $"Primary")

        val dataDict = spark.read.format("json").option("multiline", true).option("mode", "FAILFAST").load(config.dataDictInputFile)

        val (data0, negdata) = readData(spark, config, mapping)
        var data = data0
        logger.info("\n"+ to_string("raw data", data.select("proposal_id", "redcap_repeat_instance", "redcap_repeat_instrument", "heal_study")))
        data.persist(StorageLevel.MEMORY_AND_DISK)

        val dataCols = data.columns.toSeq

        data = generateID(spark, config, mapping, data)

        // 
        val tableMap = Map[String, DataFrame]()
        val columnsToCopy = copy(spark, config, tableMap, mapping, data)
        val columnsToUnpivot = collect(spark, config, tableMap, mapping, data)

        val (unknown, missing) = diff(spark, mapping, columnsToCopy ++ columnsToUnpivot)
        writeDataframe(hc, config.outputDir + "/unknown", unknown)
        writeDataframe(hc, config.outputDir + "/missing", missing)

        // data.cache()
        tableMap.foreach {
          case (table, df) =>
            val file = s"${config.outputDir}/tables/${table}"
            df.persist(StorageLevel.MEMORY_AND_DISK)
            logger.info("\n" + to_string(s"table $table", df))
            writeDataframe(hc, file, df, header = true)
        }

        val file2 = s"${config.outputDir}/tables/reviewer_organization"
        val extendColumnPrefix = "reviewer_name_"
        val reviewerOrganizationColumns = dataCols.filter(column => column.startsWith(extendColumnPrefix))
        logger.info("processing table reviewer_organization extending columns " + reviewerOrganizationColumns)
        if (reviewerOrganizationColumns.size > 0) {
            val df = reviewerOrganizationColumns.map(reviewOrganizationColumn => {
              val reviewers = data.select(data.col(reviewOrganizationColumn).as("reviewer")).filter($"reviewer" =!= "").distinct
              val organization = reviewOrganizationColumn.drop(extendColumnPrefix.length)
              reviewers.withColumn("organization", lit(organization))
            }).reduceOption(_ union _).getOrElse(spark.createDataFrame(Seq[Row]().asJava, StructType(Seq(StructField("reviewer", StringType, false), StructField("organization", StringType, false)))))
            writeDataframe(hc, file2, df, header = true)
        }
        val file3 = s"${config.outputDir}/tables/name"
        val func1 = udf((x : String) => DSLParser.fields(DSLParser(x)) match {
          case Nil => null
          case a :: _ => a
        })
        val ddrdd = dataDict
          .join(mapping
            .withColumn("field_name", func1($"Fieldname_redcap"))
            , Seq("field_name"))
          .filter($"select_choices_or_calculations" =!= "")
          .select("field_name", "select_choices_or_calculations", "Fieldname_CTMD", "Table_CTMD")
          .rdd
          .flatMap(row => {
            val field_name = row.getString(0)
            val select_choices_or_calculations = row.getString(1)
            val field_name_HEAL = row.getString(2)
            val table_name = row.getString(3)
            MetadataParser(select_choices_or_calculations) match {
              case None => Seq()
              case Some(cs) =>
                cs.map {
                  case Choice(i, d) =>
                    Row(field_name, table_name, field_name_HEAL, i, d)
                }
            }
          })
        // the lit() function creates a Column object out of a literal value
        val ctsa = dataDict
          .filter($"field_name".rlike("^ctsa_[0-9]*$"))
          .select(lit("org_name").as("field_name"), lit("Submitter").as("table"), lit("submitterInstitution").as("column"), $"field_name".substr(lit(6), length($"field_name")).as("index"), $"field_label".as("description"))
        val df2 = spark.createDataFrame(ddrdd, StructType(Seq(
          StructField("field_name", StringType, true),
          StructField("table", StringType, true),
          StructField("column", StringType, true),
          StructField("index", StringType, true),
          StructField("description", StringType, true)
        ))).union(ctsa).withColumn("id", concat($"field_name", lit("___"), $"index")).drop("field_name")
        writeDataframe(hc, file3, df2, header = true)

        spark.stop()
        
      case None =>
    }

  }
}
