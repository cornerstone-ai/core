package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object VideoComposer extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/video-composer.AGENT.md"),
    PreloadFile("plan/video-composer.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Video Composer plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "VideoComposer"
}
