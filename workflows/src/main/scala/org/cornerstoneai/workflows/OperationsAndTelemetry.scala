package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object OperationsAndTelemetry extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/operations-and-telemetry.AGENT.md"),
    PreloadFile("plan/operations-and-telemetry.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Operations and Telemetry plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "OperationsAndTelemetry"
}
