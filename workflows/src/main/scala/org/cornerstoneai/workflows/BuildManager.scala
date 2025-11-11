package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object BuildManager extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/build-manager.AGENT.md"),
    PreloadFile("plan/build-manager.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Build Manager plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "BuildManager"
}
