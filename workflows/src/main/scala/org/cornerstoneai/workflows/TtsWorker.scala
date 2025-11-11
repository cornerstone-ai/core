package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object TtsWorker extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/tts-worker.AGENT.md"),
    PreloadFile("plan/tts-worker.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone TTS Worker plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "TtsWorker"
}
