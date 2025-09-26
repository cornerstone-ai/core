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

object VideoComposer {
  private val spec  = Context.preloadFile("CornerstoneSpec", "/Users/paul/github/TopAigents/cornerstone/SPEC.md")
  private val agent = Context.preloadFile("VideoComposerAgent", "/Users/paul/github/TopAigents/cornerstone/plan/video-composer.AGENT.md")
  private val plan  = Context.preloadFile("VideoComposerPlan",  "/Users/paul/github/TopAigents/cornerstone/plan/video-composer.md")

  private val basePrompt = Try("buildPrompt", List() -> str(
    "You are the agent for the Cornerstone Video Composer plan. You preload SPEC.md, your AGENT.md, and your plan."
  ))

  private val systemMessage = ChatMessage(
    "system",
    str(
      basePrompt.resultValue.cel +
        ("\r\rcornerstone/SPEC.md contents:\r": Cel) + spec.resultValue.cel +
        ("\r\rcornerstone/plan/video-composer.AGENT.md contents:\r": Cel) + agent.resultValue.cel +
        ("\r\rcornerstone/plan/video-composer.md contents:\r": Cel) + plan.resultValue.cel
    )
  )

  val workflow = Workflow(
    basePrompt +: spec +: agent +: plan +: CliEventHandler(
      systemMessage,
      runners = DepMap.depsFor("VideoComposer")
    ).steps
  )

  def apply(name: String, sessionId: Value[String], query: BaseValue[String], model: Field, background: Boolean): Call[RunWorkflowArgs[CliEventHandler.Input], ChatToolResponse] = {
    val args = RunWorkflowArgs(str("cornerstone-VideoComposer${WORKFLOW_ENV}"), obj(CliEventHandler.Input(sessionId, query, model, background = Value(background))))
    Call(name, "googleapis.workflowexecutions.v1.projects.locations.workflows.executions.run", obj(args))
  }

  val runner: Tools.Runner = Tools.invokerRunner(
    name = "CornerstoneVideoComposer",
    description = "Agent workflow for the Cornerstone Video Composer plan; preloads SPEC.md, plan, and operating guide.",
    onQuery = query => apply(
      "query_cornerstone_video_composer",
      str("cornerstone-CornerstoneVideoComposer"),
      query,
      CliEventHandler.input.model,
      true
    ).flatMap(_.message).flatMap(_.content)
  )
}
