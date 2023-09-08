// ReactDOM.createRoot(root).render(<App/>)

import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/fiberReconciler';
import { ReactElementType } from 'shared/ReactTypes';
import { Container } from './hostConfig';

export function createRoot(container: Container) {
	// root为整个应用的根节点
	const root = createContainer(container);

	return {
		// element为消费jsx生成的ReactElement
		render(element: ReactElementType) {
			return updateContainer(element, root);
		}
	};
}
