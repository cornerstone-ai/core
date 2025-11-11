package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object SecurityAndAuth extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/security-and-auth.AGENT.md"),
    PreloadFile("plan/security-and-auth.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Security and Auth plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "SecurityAndAuth"
}
