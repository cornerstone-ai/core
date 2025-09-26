// cornerstone/build.sbt
ThisBuild / scalaVersion := "3.3.1"

name := "cornerstone"
organization := "com.topaigents"
version := "0.1.0-SNAPSHOT"

// Depend on locally published AWFL workflows jar
libraryDependencies ++= Seq(
  "us.awfl" %% "awfl-workflows" % "0.1.0-SNAPSHOT"
)

// Enable useful compiler options and allow implicit conversions used by the DSL
scalacOptions ++= Seq(
  "-deprecation",
  "-feature",
  "-language:implicitConversions"
)
