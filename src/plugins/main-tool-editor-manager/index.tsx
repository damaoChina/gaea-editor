import { Connect } from "dynamic-react"
import * as _ from "lodash"
import * as React from "react"
import * as ReactDOM from "react-dom"
import Icon from "../../../components/icon/src"
import { TabPanel, Tabs } from "../../../components/tabs/src/"
import * as Styled from "./index.style"
import { Props, State } from "./index.type"

@Connect
class MainToolEditorManager extends React.Component<Props, State> {
  public static defaultProps = new Props()
  public state = new State()

  /**
   * 组件实例的信息
   */
  private instanceInfo: InstanceInfo

  public render() {
    // 当前编辑组件的 key
    const instanceKey = this.props.stores.ViewportStore.currentEditInstanceKey

    if (!this.props.stores.ViewportStore.instances.has(instanceKey)) {
      return null
    }

    this.instanceInfo = this.props.stores.ViewportStore.instances.get(instanceKey)

    // 如果没有传入 editor，就使用组件根节点的 editor
    const editors = this.props.editors || this.props.actions.ApplicationAction.getSettingByInstance(this.instanceInfo).editors || []

    const EditorFields = editors.map((editor, index) => {
      if (typeof editor === "string") {
        return (
          <Styled.TabTitle key={index}>{editor}</Styled.TabTitle>
        )
      } else {
        const realField = this.props.realField === "" ? editor.field : this.props.realField + "." + editor.field

        let result: React.ReactNode = null
        const isVariable = this.props.actions.ViewportAction.instanceFieldIsVariable(this.props.stores.ViewportStore.currentEditInstanceKey, realField)

        if (!isVariable) {
          // 正常编辑
          result = this.props.actions.ApplicationAction.loadPluginByPosition(`mainToolEditorType${_.upperFirst(_.camelCase(editor.type))}`, {
            editor,
            realField
          })
        } else {
          // 变量模式
          result = this.props.actions.ApplicationAction.loadPluginByPosition("mainToolEditorVariable", {
            editor,
            realField
          })
        }

        return (
          <Styled.EditorContainer key={index}>
            {result}
            <Styled.Variable onClick={this.handleToggleValueType.bind(this, realField)}>
              {isVariable ? <Icon type="database" size={14} /> : <Icon type="keybroad" />}
            </Styled.Variable>
          </Styled.EditorContainer>
        )
      }
    })

    return (
      <div>{EditorFields}</div>
    )
  }

  /**
   * 切换值类型，手动填写（editor） <-> 使用变量
   */
  private handleToggleValueType = (realField: string) => {
    const isVariable = this.props.actions.ViewportAction.instanceFieldIsVariable(this.props.stores.ViewportStore.currentEditInstanceKey, realField)

    if (isVariable) {
      // 取消变量模式
      this.props.actions.ViewportAction.instanceDisableVariable(this.props.stores.ViewportStore.currentEditInstanceKey, realField)
    } else {
      // 设置为变量模式
      this.props.actions.ViewportAction.instanceEnableVariable(this.props.stores.ViewportStore.currentEditInstanceKey, realField)
    }

    this.forceUpdate()
  }
}

export default {
  position: "mainToolEditorManager",
  class: MainToolEditorManager
}
