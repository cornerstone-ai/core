package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object CliIntegration extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/cli-integration.AGENT.md"),
    PreloadFile("plan/cli-integration.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone CLI Integration plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "CliIntegration"
}
