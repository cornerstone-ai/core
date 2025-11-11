package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object ApiServer extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/api-server.AGENT.md"),
    PreloadFile("plan/api-server.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone API Server plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "ApiServer"
}
