package org.cornerstoneai.workflows

import us.awfl.dsl.*
import us.awfl.dsl.CelOps.*
import us.awfl.dsl.auto.given
import us.awfl.workflows.traits.Agent

object FirestoreAndStorage extends Agent {
  override def preloads = List(
    PreloadFile("SPEC.md"),
    PreloadFile("plan/firestore-and-storage.AGENT.md"),
    PreloadFile("plan/firestore-and-storage.md")
  )

  override def prompt =
    "You are the agent for the Cornerstone Firestore and Storage plan. You preload SPEC.md, your AGENT.md, and your plan."

  val runner = "FirestoreAndStorage"
}
