import { useState } from 'react';
import ReactDOM from 'react-dom/client';

// console.log(import.meta.hot);

//调试useState
// function App() {
// 	const [num, setNum] = useState(300);
// 	window.setNum = setNum;
// 	return <div>{num}</div>;
// }

//调试FC渲染
function App() {
	return <Child></Child>;
}

function Child() {
	console.log(111222);

	return <span>big-react</span>;
}
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
