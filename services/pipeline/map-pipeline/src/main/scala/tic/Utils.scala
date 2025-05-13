package tic

import java.io._
import scala.collection.JavaConverters._
import java.util.concurrent.atomic.AtomicInteger
import org.apache.hadoop.conf.Configuration
import org.apache.hadoop.fs._
import org.apache.spark.sql.{DataFrame, Row, SparkSession}
import org.apache.spark.sql.catalyst.encoders.RowEncoder
import org.apache.spark.sql.types._
import org.joda.time.DateTime

import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.ref.SoftReference

import scala.collection.mutable.Map

object Utils {

  def time[R](block: =>R) : R = {
    val start = System.nanoTime
    val res = block
    val finish = System.nanoTime
    val duration = (finish - start) / 1e9d
    println("time " + duration + "s")
    res
  }

  def writeDataframe(hc: Configuration, output_file: String, table: DataFrame, header : Boolean = false): Unit = {
    val dname = output_file + "_temp"
    val dpath = new Path(dname)
    table.write.option("sep", ",").option("header", value = false).option("quote", "\"").option("escape", "\"").csv(dname)

    val output_file_path = new Path(output_file)
    val output_file_file_system = output_file_path.getFileSystem(hc)
    output_file_file_system.delete(output_file_path, true)
    copyMerge(hc, output_file_file_system, overwrite = true, output_file, dpath)

    if(header) {
      prependStringToFile(hc, table.columns.mkString(",") + "\n", output_file)
    }

  }

  def writeToFile(hc:Configuration, path :String, text :String) : Unit = {
    val output_file_path = new Path (path)
    val output_file_file_system = output_file_path.getFileSystem (hc)
    val output_file_output_stream = output_file_file_system.create (output_file_path)
    writeStringToOutputStream(output_file_output_stream, text)
    output_file_output_stream.close ()
  }

  private def writeStringToOutputStream(output_file_output_stream: FSDataOutputStream, text: String): Unit = {
    val bytes = text.getBytes("utf-8")
    output_file_output_stream.write(bytes)
  }

  def prependStringToFile(hc:Configuration, text : String, path : String) : Unit = {
    val input_file_path = new Path(path)
    val input_file_fs = input_file_path.getFileSystem(hc)
    val path2 = path + ".tmp"
    val temp_input_file_path = new Path(path2)
    input_file_fs.rename(input_file_path, temp_input_file_path)

    val output_file_output_stream = input_file_fs.create (input_file_path)

    writeStringToOutputStream(output_file_output_stream, text)
    appendFileToOutputStream(hc, output_file_output_stream, path2)
    output_file_output_stream.close()
    input_file_fs.delete(temp_input_file_path, false)
  }

  def appendStringToFile(hc:Configuration, path :String, text:String) : Unit = {
    val bytes = text.getBytes ("utf-8")
    val output_file_path = new Path (path)
    val output_file_file_system = output_file_path.getFileSystem (hc)
    val output_file_output_stream = output_file_file_system.append (output_file_path)
    output_file_output_stream.write (bytes)
    output_file_output_stream.close ()
  }

  def appendFileToOutputStream(hc : Configuration, output_file_output_stream: FSDataOutputStream, input_file_path: Path) : Unit = {
    val input_file_file_system = input_file_path.getFileSystem(hc)
    val input_file_input_stream = input_file_file_system.open(input_file_path)

    val buf = new Array[Byte](BUFFER_SIZE)

    var n = input_file_input_stream.read(buf)
    while (n != -1) {
      output_file_output_stream.write(buf, 0, n)
      n = input_file_input_stream.read(buf)
    }

    input_file_input_stream.close()
  }

  def appendFileToOutputStream(hc : Configuration, output_file_output_stream: FSDataOutputStream, path2: String) : Unit = {
    val input_file_path = new Path(path2)
    appendFileToOutputStream(hc, output_file_output_stream, input_file_path)
  }

  def appendToFile(hc:Configuration, path :String, path2:String) : Unit = {
    val output_file_path = new Path (path)
    val output_file_file_system = output_file_path.getFileSystem (hc)
    val output_file_output_stream = output_file_file_system.append(output_file_path)
    appendFileToOutputStream(hc, output_file_output_stream, path2)
    output_file_output_stream.close ()
  }

  def to_seq(header: Path, itr: RemoteIterator[LocatedFileStatus]) : Seq[Path] = {
    val listBuf = new ListBuffer[Path]
    listBuf.append(header)
    to_seq(listBuf,itr)
    listBuf
  }

  def to_seq(itr: RemoteIterator[LocatedFileStatus]) : Seq[Path] = {
    val listBuf = new ListBuffer[Path]
    to_seq(listBuf, itr)
    listBuf
  }

  def to_seq(listBuf: ListBuffer[Path], itr: RemoteIterator[LocatedFileStatus]) : Unit = {
    while(itr.hasNext) {
      val fstatus = itr.next()
      listBuf.append(fstatus.getPath)
    }
  }

  def copyMerge(hc: Configuration, output_dir_fs: FileSystem, overwrite: Boolean, output_filename: String, header_file_path: Path, coldir: Path): Boolean = {
    val srcs = to_seq(header_file_path, output_dir_fs.listFiles(coldir, false))
    copyMerge(hc, output_dir_fs, overwrite, output_filename, coldir, srcs)
  }

  def copyMerge(hc: Configuration, output_dir_fs: FileSystem, overwrite: Boolean, output_filename: String, coldir: Path): Boolean = {
    val srcs = to_seq(output_dir_fs.listFiles(coldir, false))
    copyMerge(hc, output_dir_fs, overwrite, output_filename, coldir, srcs)
  }

  private def copyMerge(hc: Configuration, output_dir_fs: FileSystem, overwrite: Boolean, output_filename: String, coldir: Path, srcs: Seq[Path]) = {
    val output_file_path = new Path(output_filename)
    val output_file_output_stream = output_dir_fs.create(output_file_path)
    for (p <- srcs) {
      appendFileToOutputStream(hc, output_file_output_stream, p)
    }
    output_file_output_stream.close()
    output_dir_fs.delete(coldir, true)
  }

  val BUFFER_SIZE : Int = 4 * 1024

  case class HDFSCollection(hc: Configuration, path : Path) extends Traversable[Path] {
    override def foreach[U](f : Path => U) = {
      val fs = path.getFileSystem(hc)
      val file_iter = fs.listFiles(path, false)
      while(file_iter.hasNext) {
        val file_status = file_iter.next()
        f(file_status.getPath)
      }
    }
  }

  class Cache[K,V <: AnyRef](fun : K => V) {
    private val cache = Map[K, SoftReference[V]]()
    def apply(key: K) : V = {
      this.synchronized {
        def store = {
          val df = fun(key)
          cache(key) = new SoftReference(df)
          println("SoftReference created for " + key)
          df
        }

        cache.get(key) match {
          case None =>
            store
          case Some(x) =>
            x.get match {
              case Some(df) => df
              case None =>
                println("SoftReference has already be garbage collected " + key)
                store

            }
        }
      }
    }
  }

  def withCounter[U](a: AtomicInteger => U) : U = {
    val count = new AtomicInteger(0)
    a(count)
  }

  def fileExists(hc: Configuration, file : String) : Boolean = {
    val output_file_path = new Path(file)
    val output_file_file_system = output_file_path.getFileSystem(hc)
    output_file_file_system.exists(output_file_path)

  }
}
