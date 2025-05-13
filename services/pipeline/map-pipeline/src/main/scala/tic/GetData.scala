package tic
import dispatch._, Defaults._
import java.io.{File, PrintWriter}
import scala.util.{Success, Failure}
import scala.concurrent.Future

object GetData
{
  def getData(token: String, output_file: String) : Future[Unit] = {
    val myRequest = host("redcap.vanderbilt.edu").secure / "api" / ""
    def myPostWithParams = myRequest.POST << Map(
      "token" -> token,
      "content" -> "record",
      "format" -> "json",
      "type" -> "flat",
//      "records[0]" -> "1",
      // fields[0]=
      "rawOrLabel" -> "raw",
      "rawOrLabelHeaders" -> "raw",
      "exportCheckboxLabel" -> "false",
      "exportSurveyFields" -> "false",
      "exportDataAccessGroups" -> "false",
      "returnFormat" -> "json"
    ) <:< Map(
      "Content-Type" -> "application/x-www-form-urlencoded",
      "Accept" -> "application/json"
    )

    // val w = new PrintWriter()
    println(myPostWithParams.toRequest)
    val client = Http.default
    client(myPostWithParams > as.File(new File(output_file))).map(
      x => {
        println(x)
        client.shutdown()
      }
    )
        // w.close()

  }

  def main(argv: Array[String]) = {
    getData(argv(0), argv(1)).foreach(_ => {})
  }
}
