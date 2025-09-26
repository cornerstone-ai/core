package workflows

import dsl.*
import dsl.CelOps.*
import dsl.auto.given
import workflows.cli.CliEventHandler
import workflows.helpers.Context
import ista.ChatMessage
import services.Llm.ChatToolResponse
import workflows.tools.Tools
import workflows.codebase.jobs.ContextAgent

object OperationsAndTelemetry {
  private val spec  = Context.preloadFile("CornerstoneSpec", "/Users/paul/github/TopAigents/cornerstone/SPEC.md")
  private val agent = Context.preloadFile("OperationsAndTelemetryAgent", "/Users/paul/github/TopAigents/cornerstone/plan/operations-and-telemetry.AGENT.md")
  private val plan  = Context.preloadFile("OperationsAndTelemetryPlan",  "/Users/paul/github/TopAigents/cornerstone/plan/operations-and-telemetry.md")

  private val basePrompt = Try("buildPrompt", List() -> str(
    "You are the agent for the Cornerstone Operations and Telemetry plan. You preload SPEC.md, your AGENT.md, and your plan."
  ))

  private val systemMessage = ChatMessage(
    "system",
    str(
      basePrompt.resultValue.cel +
        ("\r\rcornerstone/SPEC.md contents:\r": Cel) + spec.resultValue.cel +
        ("\r\rcornerstone/plan/operations-and-telemetry.AGENT.md contents:\r": Cel) + agent.resultValue.cel +
        ("\r\rcornerstone/plan/operations-and-telemetry.md contents:\r": Cel) + plan.resultValue.cel
    )
  )

  val workflow = Workflow(
    basePrompt +: spec +: agent +: plan +: CliEventHandler(
      systemMessage,
      runners = DepMap.depsFor("OperationsAndTelemetry")
    ).steps
  )

  def apply(name: String, sessionId: Value[String], query: BaseValue[String], model: Field, background: Boolean): Call[RunWorkflowArgs[CliEventHandler.Input], ChatToolResponse] = {
    val args = RunWorkflowArgs(str("cornerstone-OperationsAndTelemetry${WORKFLOW_ENV}"), obj(CliEventHandler.Input(sessionId, query, model, background = Value(background))))
    Call(name, "googleapis.workflowexecutions.v1.projects.locations.workflows.executions.run", obj(args))
  }

  val runner: Tools.Runner = Tools.invokerRunner(
    name = "CornerstoneOperationsAndTelemetry",
    description = "Agent workflow for the Cornerstone Operations and Telemetry plan; preloads SPEC.md, plan, and operating guide.",
    onQuery = query => apply(
      "query_cornerstone_operations_and_telemetry",
      str("cornerstone-CornerstoneOperationsAndTelemetry"),
      query,
      CliEventHandler.input.model,
      true
    ).flatMap(_.message).flatMap(_.content)
  )
}
