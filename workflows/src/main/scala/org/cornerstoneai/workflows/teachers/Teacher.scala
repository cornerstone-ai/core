package org.cornerstoneai.workflows.teachers

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

/**
  * Teacher workflow (class project variant)
  *
  * Minimal behavior for class project usage:
  * - Preload TEACHER.md (provided by the class environment)
  * - On start, run `ls -la` in the current working directory and report output
  */
object Teacher extends Agent {
  override def preloads = List(
    PreloadFile("TEACHER.md"),
    PreloadCommand("ls -la")
  )

  override def prompt =
    "You are a clear, supportive teacher who explains concepts simply, checks understanding, and guides students through all subjects with steady encouragement."

  // Runner identifier used by CLI
  val runner = "Teacher"
}
