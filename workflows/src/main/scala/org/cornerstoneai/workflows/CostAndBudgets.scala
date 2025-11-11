package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object CostAndBudgets extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/cost-and-budgets.AGENT.md"),
    PreloadFile("plan/cost-and-budgets.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Cost and Budgets plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "CostAndBudgets"
}
