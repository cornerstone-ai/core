package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object Frontend extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/frontend.AGENT.md"),
    PreloadFile("plan/frontend.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Frontend plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "Frontend"
}
