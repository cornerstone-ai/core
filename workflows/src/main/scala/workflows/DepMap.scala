package workflows

import workflows.tools.Tools

/**
  * Centralized dependency map for Cornerstone workflows.
  *
  * Pure static mapping: no file IO, no parsing. Maps workflow name ->
  * the dependency runners that should be available to it as tools.
  */
object DepMap {
  type DepRunners = List[Tools.Runner]

  // Known workflow names (for convenience)
  val all: List[String] = List(
    "ApiServer",
    "BuildManager",
    "CiCd",
    "CliIntegration",
    "CostAndBudgets",
    "FirestoreAndStorage",
    "Frontend",
    "IngestWorker",
    "MigrationsAndScripts",
    "NlpWorker",
    "OperationsAndTelemetry",
    "Publisher",
    "Readme",
    "SecurityAndAuth",
    "TestingAndQa",
    "ThemingAssets",
    "TtsWorker",
    "VideoComposer",
    "WorkflowsScala"
  )
  
  val featureAgents = List(NlpWorker.runner, Publisher.runner)
  val featureDeps = List(FirestoreAndStorage.runner, TestingAndQa.runner, SecurityAndAuth.scala)

  // Return dependency runners for a specific workflow name.
  // Only the matched case is evaluated to minimize initialization coupling.
  def depsFor(name: String): DepRunners = name match {
    case "Frontend" => List(ApiServer.runner, TestingAndQa.runner, ThemingAssets.runner)

    // Defaults (expand these as relationships are confirmed)
    case "ApiServer"              => featureAgents ++ List(CiCd.runner)
    case "BuildManager"           => List(CiCd.runner)
    case "CiCd"                   => Nil
    case "CliIntegration"         => Nil
    case "CostAndBudgets"         => Nil
    case "FirestoreAndStorage"    => List(CiCd.runner)
    case "IngestWorker"           => featureDeps
    case "MigrationsAndScripts"   => Nil
    case "NlpWorker"              => List(WorkflowsScala.runner)
    case "OperationsAndTelemetry" => Nil
    case "Publisher"              => featureDeps
    case "Readme"                 => List(
      ApiServer.runner, BuildManager.runner, CiCd.runner, CliIntegration.runner, CostAndBudgets.runner, FirestoreAndStorage.runner, IngestWorker.runner, MigrationsAndScripts.runner,
      NlpWorker.runner, OperationsAndTelemetry.runner, Publisher.runner, SecurityAndAuth.runner, TestingAndQa.runner, ThemingAssets.runner, TtsWorker.runner, VideoComposer.runner,
      WorkflowsScala.runner
    )
    case "SecurityAndAuth"        => Nil
    case "TestingAndQa"           => List(BuildManager.runner, CiCd.runner)
    case "ThemingAssets"          => List(FirestoreAndStorage.runner)
    case "TtsWorker"              => featureDeps
    case "VideoComposer"          => featureDeps
    case "WorkflowsScala"         => List(BuildManager.runner, CiCd.runner)

    case _ => Nil
  }
}
