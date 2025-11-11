// cornerstone/build.sbt
ThisBuild / scalaVersion := "3.3.1"

name := "workflows"
organization := "org.cornerstoneai"
version := "0.1.0-SNAPSHOT"

// Depend on locally published AWFL workflows jar
libraryDependencies ++= Seq(
  "us.awfl" %% "dsl" % "0.1.1",
  "us.awfl" %% "workflow-utils" % "0.1.1",
  "us.awfl" %% "compiler" % "0.1.1",
  "us.awfl" %% "workflows" % "0.1.1"
)

// Enable useful compiler options and allow implicit conversions used by the DSL
scalacOptions ++= Seq(
  "-deprecation",
  "-feature",
  "-language:implicitConversions"
)

Compile / run / mainClass := Some("us.awfl.compiler.Main")
