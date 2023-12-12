// This is test page
import React, {
	useRef,
	useState,
	useEffect,
	useMemo,
	useCallback
} from 'react';
import {
	useDispatch,
} from 'react-redux';
import {
	StateSelected as StatePropsRoot,
	actions,
} from './store/root';


function ColDiv(props: any) {
	return (<div
		{...props}
		style={{display: 'flex', flexDirection: 'column'}}
		></div>);
}

function Button(props: any) {
	return (<button style={{width: '140px' }} {...props} />);
}

let propsv = 1;
function Props() {
	function SubProp(props: {v: number}) {
		return (<div>Sub: {props.v}</div>);
	}

	function SubProp2(props: {v: number}) {
		return (<div key={`${props.v}`}>Sub: {props.v}</div>);
	}

	return (<div>
		<Button onClick={() => propsv++}>Sub Not-Render</Button>
		<SubProp v={propsv} />
		<SubProp2 v={propsv} />
	</div>);
}

function State() {
	const [num, setNum] = useState(0);
	const [obj, setObj] = useState({});
	return (<ColDiv>
		<b>Number</b>
		<Button onClick={() => setNum(v => v)}
			>Not-Render</Button>
		<Button onClick={() => setNum(v => v + 1)}
			>Render</Button>
		<b>Object</b>
		<Button onClick={() => setObj(v => v)}
			>Not-Render</Button>
		<Button onClick={() => setObj(v => {
				v['v'] = Date.now();
				return v;
			})}
			>Not-Render2</Button>
		<Button onClick={() => setObj(v => ({...v}))}
			>Render</Button>
	</ColDiv>);
}

function Main() {
	const dispatch = useDispatch();
	const [Comp, setComp] = useState(() => State);
	useEffect(() => {
		dispatch(actions.featurePage('test'));
	}, [dispatch]);

	return (<div style={{display: 'flex'}}>
		<div style={{width: '20%', marginRight: '32px', display: 'flex', flexDirection: 'column'}}>
			<b>Tests</b>
			<Button onClick={() => setComp(() => State)}>State</Button>
			<Button onClick={() => setComp(() => Props)}>Props</Button>
		</div>
		<div style={{width: '70%'}}>
			<Comp />
		</div>

	</div>);
}
export default Main;
