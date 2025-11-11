package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object IngestWorker extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/ingest-worker.AGENT.md"),
    PreloadFile("plan/ingest-worker.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Ingest Worker plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "IngestWorker"
}
