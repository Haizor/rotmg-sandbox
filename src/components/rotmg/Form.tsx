import React, { useState } from "react";
import styles from "./Form.module.css"

export function CollapsibleSection(props: { name: string, children: React.ReactNode}) {
	const [toggled, setToggled] = useState(true)

	const result = [
		<div key="header" className={styles.sectionHeader} style={{cursor: "pointer"}} onClick={(() => setToggled(!toggled))}>{props.name}</div>,
	]

	if (toggled) {
		result.push(<div key={"data"} className={styles.section + " " + styles.fourColumn}>{props.children}</div>)
	}

	return <div className={styles.section}>
		{result}
	</div>;
}

export default abstract class Form<P = {}, S = {}> extends React.Component<P, S> {
	abstract update: () => void;
	get formStyle() {
		return styles;
	}

	textProp<T>(object: T, key: keyof T, multiLine?: boolean) {
		const onChange = (ev: React.ChangeEvent<any>) => {
			(object[key] as any) = ev.currentTarget.value;
			this.update();
		}

		if (multiLine === true) {
			return (
				<textarea value={object[key] as any} onChange={onChange} />
			)
		}
		
		return (
			<input type="text" value={object[key] as any} onChange={onChange}/>
		)
	}

	numProp<T>(object: T, key: keyof T) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(object[key] as any) = Number(ev.currentTarget.value);
			this.update();
		}
	
		return (
			<input type="number" value={object[key] as any} size={4} onChange={onChange}/>
		)
	}

	boolProp<T>(object: T, key: keyof T) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(object[key] as any) = ev.currentTarget.checked;
			this.update();
		}

		return (
			<input type="checkbox" checked={object[key] as any} onChange={onChange}/>
		)
	}

	enumProp<T>(object: T, key: keyof T, values: any) {
		if (values === undefined && typeof(values) !== "object")  {
			console.log(values)
			return null;
		}

		const options = [];

		for (const val of Object.keys(values)) {
			if (typeof values[val] === "string") {
				options.push(<option key={val} value={val}>{values[val]}</option>)
			}
		}

		const onChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
			(object[key] as any) = Number(ev.currentTarget.value)
			this.update()
		}

		return (
			<select onChange={onChange} value={object[key] as any}>
				{options}
			</select>
		)
	}

	formatProp(name: string, node: React.ReactNode, style?: string) {
		return (
			<div className={this.formStyle.property + " " + style}>
				<div className={this.formStyle.propertyName}>{name}</div>
				{node}
			</div>
		)
	}
}