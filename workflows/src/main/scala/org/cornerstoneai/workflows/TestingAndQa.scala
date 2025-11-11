package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object TestingAndQa extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/testing-and-qa.AGENT.md"),
    PreloadFile("plan/testing-and-qa.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Testing and QA plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "TestingAndQa"
}
