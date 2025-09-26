package workflows

import dsl.*
import dsl.CelOps.*
import dsl.auto.given
import workflows.cli.CliEventHandler
import workflows.helpers.Context
import ista.ChatMessage
import services.Llm.ChatToolResponse
import workflows.tools.Tools

object BuildManager {

  // Preloads
  val agentGuide = Context.preloadFile(
    "BuildManagerAgent",
    "/Users/paul/github/TopAigents/cornerstone/src/main/scala/workflows/BuildManager.AGENT.md"
  )
  val preload = Context.preloadFile(
    "BuildManager",
    "/Users/paul/github/TopAigents/cornerstone/src/main/scala/workflows/BuildManager.scala"
  )
  val buildSbt = Context.preloadFile(
    "CornerstoneBuildSbt",
    "/Users/paul/github/TopAigents/cornerstone/build.sbt"
  )

  // Diagnostics: current UTC time for traceability
  private val nowUtcCmd = """bash -lc 'date -u +%Y-%m-%dT%H:%M:%SZ'"""
  val nowUtc = Context.preloadCommand("NowUTC", nowUtcCmd)

  // Base system prompt for this agent
  private val basePrompt = Try("buildPrompt", List() -> str(
    """You are BuildManager for the Cornerstone project, a resident expert for managing Scala (sbt) builds, dependency coordinates/resolvers, and local/CI build hygiene.
      |You operate under cornerstone/src/main/scala/workflows.
      |You bootstrap your own context by reading your Scala definition file and appending it to the system prompt.
      |Also preload cornerstone/build.sbt so you can reason about build settings and dependencies.""".stripMargin
  ))

  // Compose the final system message
  private val systemMessage = ChatMessage(
    "system",
    str(
      basePrompt.resultValue.cel +
        ("\r\rcornerstone/src/main/scala/workflows/BuildManager.AGENT.md contents:\r": Cel) + agentGuide.resultValue.cel +
        ("\r\rcornerstone/src/main/scala/workflows/BuildManager.scala contents:\r": Cel) + preload.resultValue.cel +
        ("\r\rcornerstone/build.sbt contents:\r": Cel) + buildSbt.resultValue.cel +
        ("\r\rnow (UTC):\r": Cel) + nowUtc.resultValue.cel
    )
  )

  // Define the workflow with CLI integration; no extra runners for now
  val workflow = Workflow(
    basePrompt +: agentGuide +: preload +: buildSbt +: nowUtc +: CliEventHandler(
      systemMessage,
      runners = List(
        // Intentionally empty for Cornerstone unless specific tool runners are added
      )
    ).steps
  )

  // Expose this workflow as a query-only runner
  def apply(
      name: String,
      sessionId: Value[String],
      query: BaseValue[String],
      model: Field,
      background: Boolean
  ): Call[RunWorkflowArgs[CliEventHandler.Input], ChatToolResponse] = {
    val args = RunWorkflowArgs(
      str("cornerstone-workflows-BuildManager${WORKFLOW_ENV}"),
      obj(CliEventHandler.Input(sessionId, query, model, background = Value(background)))
    )
    Call(name, "googleapis.workflowexecutions.v1.projects.locations.workflows.executions.run", obj(args))
  }

  val runner: Tools.Runner = Tools.invokerRunner(
    name = "BuildManager",
    description = "Cornerstone BuildManager: manages Scala sbt builds, dependencies, and resolvers; preloads its agent guide, own source, and cornerstone/build.sbt.",
    onQuery = query => apply(
      "query_build_manager_cornerstone",
      str("cornerstone-workflows-BuildManager"),
      query,
      CliEventHandler.input.model,
      true
    ).flatMap(_.message).flatMap(_.content)
  )
}
