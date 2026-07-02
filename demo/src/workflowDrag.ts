export const workflowPresetDragType = "application/x-flowkit-workflow-preset";

export type WorkflowPresetDragPayload = {
  presetType: string;
};

export function encodeWorkflowPresetDragPayload(presetType: string): string {
  return JSON.stringify({ presetType } satisfies WorkflowPresetDragPayload);
}

export function decodeWorkflowPresetDragPayload(value: string): WorkflowPresetDragPayload | null {
  try {
    const payload = JSON.parse(value) as Partial<WorkflowPresetDragPayload>;

    return typeof payload.presetType === "string" && payload.presetType.length > 0
      ? { presetType: payload.presetType }
      : null;
  } catch {
    return null;
  }
}
