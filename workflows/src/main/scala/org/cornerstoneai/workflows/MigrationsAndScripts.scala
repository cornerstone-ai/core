package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object MigrationsAndScripts extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/migrations-and-scripts.AGENT.md"),
    PreloadFile("plan/migrations-and-scripts.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Migrations and Scripts plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "MigrationsAndScripts"
}
