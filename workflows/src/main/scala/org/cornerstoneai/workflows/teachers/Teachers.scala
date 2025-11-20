package org.cornerstoneai.workflows.teachers

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

/**
  * Teachers workflow (class project variant)
  *
  * Minimal behavior for class project usage:
  * - Preload TEACHER.md
  * - On start, run `ls -la` in the current working directory and report output
  */
object Teachers extends Agent {
  override def preloads = List(
    PreloadFile("TEACHER.md")
  )

  override def prompt =
    "You are the Cornerstone Teachers agent. Preload TEACHER.md. When invoked, first run the shell command `ls -la` in the current working directory and report the output, then wait for further instructions."

  // Runner identifier used by CLI
  val runner = "Teachers"
}
