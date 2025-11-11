package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object NlpWorker extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/nlp-worker.AGENT.md"),
    PreloadFile("plan/nlp-worker.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone NLP Worker plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "NlpWorker"
}
