name := "TIC preprocessing"

version := "0.2.0"

scalaVersion := "2.11.8"

libraryDependencies += "org.apache.spark" %% "spark-sql" % "2.3.2"
libraryDependencies += "com.github.scopt" %% "scopt" % "4.0.0-RC2"
libraryDependencies += "org.scala-lang.modules" %% "scala-parser-combinators" % "1.1.1"
libraryDependencies += "org.dispatchhttp" %% "dispatch-core" % "1.0.0"

assemblyMergeStrategy in assembly := {
  case PathList("javax", "inject", _*) => MergeStrategy.last
  case PathList("javax", "activation", _*) => MergeStrategy.last
  case PathList("com", "sun", "activation", _*) => MergeStrategy.last
  case PathList("io", "netty", _*) => MergeStrategy.last
  case PathList("META-INF", "native", _*) => MergeStrategy.last
  case PathList("META-INF", "io.netty.versions.properties") => MergeStrategy.last
  case PathList("org", "apache", _*) => MergeStrategy.last
  case PathList("org", "aopalliance", _*) => MergeStrategy.last
  case PathList("mime.types") => MergeStrategy.last
  case PathList("git.properties") => MergeStrategy.discard
  case x =>
    val oldStrategy = (assemblyMergeStrategy in assembly).value
    oldStrategy(x)
}

mainClass in assembly := Some("tic.Transform")
