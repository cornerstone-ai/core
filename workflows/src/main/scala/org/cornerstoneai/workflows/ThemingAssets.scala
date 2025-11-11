package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object ThemingAssets extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/theming-assets.AGENT.md"),
    PreloadFile("plan/theming-assets.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Theming Assets plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "ThemingAssets"
}
