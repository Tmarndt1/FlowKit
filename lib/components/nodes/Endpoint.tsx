import React, { useState } from "react";
import { IEndpoint, IEndpointConnection } from "../../interfaces/IEndpoint";
import { IOffset } from "../../interfaces/IOffset";
import {
	NodeFlowContext,
	useNodeFlowInteractionStore,
	useNodeFlowSelectionStore,
} from "../../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../../contexts/FlowKitConfigContext";

enum IsValid {
	None,
	True,
	False,
}

interface IProps {
    children?: React.ReactNode;
	endpoint: IEndpoint<any>;
	style?: React.CSSProperties;
	className?: string;
	canDrop?: () => boolean;
	canDrag?: () => boolean;
}

interface IState {
	valid: IsValid;
	usable: boolean;
}

export const Endpoint: React.FC<IProps> = (props) => {
	const { canConnect } = useFlowKitConfig();
	const stores = React.useContext(NodeFlowContext);
	const sourceEndpoint = useNodeFlowInteractionStore((state) => state.sourceEndpoint);
	const edgeSelected = useNodeFlowSelectionStore(
		(state) =>
			state.selectedEdge?.sourceId === props.endpoint.id ||
			state.selectedEdge?.targetId === props.endpoint.id
	);
	const setSourceEndpoint = useNodeFlowInteractionStore((state) => state.setSourceEndpoint);
	const dropEndpoint = useNodeFlowInteractionStore((state) => state.dropEndpoint);

	const [state, setState] = useState<IState>({
		valid: IsValid.None,
		usable: true,
	});

	const creatingEdge = sourceEndpoint != null;

	const startEdge = (): void => {
		if (typeof props.canDrag === "function" && props.canDrag() === false) return;

		const html: HTMLElement | null = document.getElementById(props.endpoint.id);

		if (html == null) return;

		const offset: IOffset = html.getBoundingClientRect();

		setSourceEndpoint({
			endpoint: props.endpoint,
			offset: offset,
		});
	};

	const releaseEdge = (): void => {
        const currentSourceEndpoint = stores?.interaction.getState().sourceEndpoint;

		if (
            currentSourceEndpoint != null &&
            state.valid !== IsValid.False &&
            canConnect?.({
                source: currentSourceEndpoint.endpoint,
                target: props.endpoint,
            }) !== false
        ) {
			dropEndpoint(props.endpoint.id);

			setState((prevState) => ({
				...prevState,
				valid: IsValid.None,
			}));
		}
	};

	const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
		e.stopPropagation();
		e.preventDefault();

		startEdge();
	};

	const onMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
		e.stopPropagation();
		e.preventDefault();

		releaseEdge();
	};

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
		e.stopPropagation();
		e.preventDefault();

		e.currentTarget.setPointerCapture?.(e.pointerId);
		startEdge();
	};

	const onPointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
		e.stopPropagation();
		e.preventDefault();

		e.currentTarget.releasePointerCapture?.(e.pointerId);
		releaseEdge();
	};

	const onMouseOver = (): void => {
		if (props.canDrop?.() === false && creatingEdge) {
			setState((prevState) => ({
				...prevState,
				valid: IsValid.False,
				usable: false,
			}));
		} else if (creatingEdge && typeof (canConnect) === "function") {
			if (sourceEndpoint == null) return;

			const valid: IsValid = canConnect?.({
				source: sourceEndpoint.endpoint,
				target: props.endpoint,
			}) ? IsValid.True : IsValid.False;

			setState((prevState) => ({
				...prevState,
				valid: valid,
				usable: valid === IsValid.True ? true : false,
			}));
		} else if (!creatingEdge && typeof(props.canDrag) === "function") {
			setState((prevState) => ({
				...prevState,
				usable: props.canDrag?.() ?? false,
			}));
		} else {
			setState((prevState) => ({
				...prevState,
				usable: true,
			}));
		}
	};

	const isSource = sourceEndpoint?.endpoint.id === props.endpoint.id;
	const immediateValid = creatingEdge && sourceEndpoint != null && !isSource
		? canConnect?.({ source: sourceEndpoint.endpoint, target: props.endpoint }) !== false
			? IsValid.True
			: IsValid.False
		: state.valid;

	let style: React.CSSProperties = {
		top: props.endpoint.offset.y,
		left: props.endpoint.offset.x,
		transform: "translate(-50%, -50%)",
		background: edgeSelected ? undefined : immediateValid === IsValid.False ? "#ff615d" : "#00ff7f",
		cursor: state.usable ? "crosshair" : "auto",
		...props.style ?? {}
	};

  	let className: string = "flow-kit-endpoint";

	if (edgeSelected) {
		className += " flow-kit-endpoint-selected";
	}

  	if (props.className) className += ` ${props.className}`;

  	return (
		<div
            id={props.endpoint.id}
            key={props.endpoint.id}
            className={className}
            style={style}
            data-position={props.endpoint.position}
            onMouseDownCapture={onMouseDown}
            onMouseUp={onMouseUp}
            onPointerDownCapture={onPointerDown}
            onPointerUp={onPointerUp}
            onMouseOver={onMouseOver}
            onMouseLeave={() => setState((prevState) => ({ ...prevState, valid: IsValid.None }))}
        >
            { props.children }
        </div>
  	);
};
