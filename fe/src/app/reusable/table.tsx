import React, {
	useRef,
	useState,
	useEffect,
	useMemo,
	useCallback
} from 'react';
import * as mui from '@mui/material';
import * as icons from '@mui/icons-material';
import { FixedSizeList as RvList } from 'react-window';
import RvAutoSizer from 'react-virtualized-auto-sizer';


import { DEFAULT_SCROOLBAR_WIDTH } from './const';
import { pxToNum } from './ut';
import measure from './measure';
import { useCmpState } from './hook';
import Tooltip from './tooltip';
import Val from './val';
import TextField from './textfield';
import css from './table.module.scss';

export type SortType = '' | 'asc' | 'desc';

export interface DataEntry {
	[k: string]: any;
}
export interface TableColumn<T = any> {
	key: string; /** unique property name of column */
	name?: string; /** Name of this colume */
	description?: string;
	style?: {[p: string]: string};
	headStyle?: {[p: string]: string};
	filterable?: boolean;
	sortable?: boolean;
	renderer?: (v: T) => JSX.Element;
	notify?: (msg: string) => void;
	cmp?: (a: T, b: T) => number;
	filter?: (a: T, filterValue: string) => boolean;
	// Notification
	onFilterChange?: (key: string, filterValue: string) => void;
	onSortChange?: (key: string, sortValue: SortType) => void;
}

interface Props<T extends DataEntry = any> {
	rowHeight?: number;
	columns: TableColumn[];
	data: T[];
	fn: {
		onSelectRow?: (index: number) => void;
	};
	sortBy?: string; // key of columns
	sortOrder?: Exclude<SortType, ''>; // default descending
}

export type TableProps<T = any> = Props<T>;

interface ColumnFilters {
	[i: number]: string;
}

interface TableEntry<T = unknown> {
	i: number;
	d: T;
}

function emptySort() {
	return {i: -1, sort: '' as SortType};
}

function lcSortFunc(lc: TableColumn) {
	return lc.cmp
		? (a: TableEntry, b: TableEntry) => lc.cmp(a.d[lc.key], b.d[lc.key])
		// default compare - string compare
		: (a: TableEntry, b: TableEntry) => `${a.d[lc.key]}`.localeCompare(`${b.d[lc.key]}`);
}

function TableHeaderCell(props: {
	lc: TableColumn;
	sort: SortType;
	filter: string;
	fn: {
		onSortChange: (sortType: SortType) => void;
		onFilterChange: (v: string) => void;
	};
}) {
	const P = props;
	const label = P.lc.name || P.lc.key.toUpperCase();

	const onSortClick = () => {
		P.fn.onSortChange(P.sort === 'desc' ? 'asc' : 'desc');
	};

	return (<>
	{P.lc.sortable
		? (<mui.IconButton size='small'
			onClick={onSortClick}
			>{
			P.sort === ''
				? (<icons.Sort fontSize='inherit' />)
				: P.sort === 'asc'
					? (<icons.ArrowDownward fontSize='inherit' />)
					: (<icons.ArrowUpward fontSize='inherit' />)
			}</mui.IconButton>)
		: null}
	{P.lc.filterable
		? <TextField
			variant='outlined'
			className={css.headerTextField}
			InputProps={{
				classes: {
					input: css.headerTextFieldInput
				}
			}}
			size='small'
			margin='dense'
			fullWidth
			label={label}
			value={P.filter}
			onChangeDebounceTime={500}
			onChangeDebounced={P.fn.onFilterChange}
			/>
		: (<Val v={label}
		style={{fontWeight: 700}}
		/>)
	}
	</>);
}

function TableHeader(P: {
	width: number;
	headerHeight: number;
	columns: TableColumn[];
	datasz: number; // number of data
	sort?: ReturnType<typeof emptySort>;
	filters?: {[i: number]: string};
	fn: {
		onSortChange: (columnIndex: number, sortType: SortType) => void;
		onFilterChange: (columnIndex: number, v: string) => void;
	};
}) {
	const sort = P.sort ?? emptySort();
	const filters = P.filters ?? {};

	return (<div style={{
		width: P.width,
		height: P.headerHeight
		}}>
		<div className={css.header}>
			{P.columns.map((col, coli) => (
				<Tooltip
					key={col.key}
					title={col.description ?? ''}
					>
					<div
						className={css.headerCell}
						style={({...col.style, ...col.headStyle})}
						>
						<TableHeaderCell
							lc={col}
							sort={sort.i === coli ? sort.sort : ''}
							filter={filters[coli] ?? ''}
							fn={{
								onSortChange: v => P.fn.onSortChange(coli, v),
								onFilterChange: v => P.fn.onFilterChange(coli, v)
							}}
							/>
					</div>
				</Tooltip>
			))}
		</div>
		<mui.Divider variant='middle' />
	</div>);

}

function noRowRenderer() {
	return (<div style={{
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: '48px',
	}}><b>No Data</b></div>);
}

// virtual list table
export function Table(P: Props) {
	const rowHeight = P.rowHeight ?? pxToNum(css.rowHeight);

	// Supporting to sort single column
	const [data, setData] = useState<{i: number; d: DataEntry}[]>([]);
	const [sort, setSort] = useCmpState(emptySort());
	const [filters, setFilters] = useCmpState({} as {[i: number]: string});

	useEffect(() => {
		// console.log('useEffect: sortedColumn');
		const sortOrder = P.sortOrder ?? 'asc';
		const sortBy = P.columns.findIndex(d => d.key === P.sortBy);
		setSort({i: sortBy, sort: sortOrder});
	}, [P.sortOrder, P.columns, P.sortBy, setSort]);

	const onSortChange = (i: number, _sort: SortType) => {
		const lc = P.columns[i];
		lc.onSortChange && lc.onSortChange(lc.key, _sort);
		setSort({
			i,
			sort: _sort
		});
	};

	useEffect(() => {
		// console.log('useEffect: data, setFilters');
		setFilters({});
		setData(P.data);
	}, [P.data, setFilters]);

	useEffect(() => {
		// console.log('useEffect... data!!!');
		let newData = P.data.map<TableEntry>((d, i) => ({i, d}));
		if (sort.i >= 0 && '' !== sort.sort) {
			const lc = P.columns[sort.i];
			newData.sort(lcSortFunc(lc));
			if ('desc' === sort.sort) {
				newData.reverse();
			}
		}
		for (const [i, v] of Object.entries(filters)) {
			if (!v) { continue; }
			const lc = P.columns[i];
			newData = newData.filter(d => (lc.filter
				?? ((_e, _v) => `${_e}`.indexOf(_v) >= 0)
			)(d.d[lc.key], v));
		}
		setData(newData);
	}, [
		P.data,
		P.columns,
		P.sortBy,
		P.sortOrder,
		sort,
		filters
	]);

	const onFilterChange = (i: number, v: string) => {
		const lc = P.columns[i];
		// Filtering only one column is supported at this moment.
		// console.log('onFilterChange: ', i, '/', v);
		lc.onFilterChange && lc.onFilterChange(lc.key, v);
		setFilters(_filters => {
			const newFilters = {..._filters};
			newFilters[i] = v;
			return newFilters;
		});
	};

	const fn = {
		onSortChange,
		onFilterChange
	};

	const rowRenderer = ({index, key, width, style}) => {
		/* if (isScrolling) {
			return (<div key={key} style={style}>Scrolling...</div>);
		} */
		const row = data[index];
		return (<div key={key}
			style={{
				...style,
				width,
			}}>
			<mui.ButtonBase
				classes={{
					root: css.row
				}}
				disabled={!P.fn.onSelectRow}
				onClick={() => {
					P.fn.onSelectRow(row.i);
				}}
				>{
				P.columns.map((col, coli) => (<div
					key={col.key}
					className={css.rowCell}
					style={col.style}
					>
					{!!col.renderer
						? col.renderer(row.d[col.key])
						: <Val v={row.d[col.key]} />}
				</div>))
			}</mui.ButtonBase>
			<mui.Divider variant='middle' />
		</div>);
	};

	return (<RvAutoSizer>
	{({width, height}) => {
		const headerHeight = pxToNum(css.headerHeight);
		const totalHeight = rowHeight * P.data.length + headerHeight;
		const adjustedScrollbarWidth =  totalHeight > height
			? (measure.scrollbarWidth || DEFAULT_SCROOLBAR_WIDTH)
			: 0;
		const rowWidth = width - adjustedScrollbarWidth;
		return (<div className={css.root}>
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width,
			}}
			>
			<TableHeader
				width={rowWidth}
				headerHeight={headerHeight}
				columns={P.columns}
				datasz={data.length}
				sort={sort}
				filters={filters}
				fn={fn}
				/>
			{(0 < data.length)
			? <RvList
				height={height}
				width={width}
				itemCount={data.length}
				itemSize={rowHeight}
				>
				{({index, style}) => rowRenderer(
					{index, key: index, width: rowWidth, style})}
			</RvList>
			: noRowRenderer()
			}
		</div>
	</div>);
	}}
	</RvAutoSizer>);
}
export default Table;
