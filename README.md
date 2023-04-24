# xxy-react
从0实现React源码


# 从0实现react



## JSX实现



## rollup打包

> 1. 自定义的utils方法，
>
>    ```js
>    //传入包名，就能解析出包对应的路径
>    resolvePkgPath(pkgName, isDist)	
>    
>    //传入包名，就能此包依赖文件packages.json文件的文件信息，后续解构出需要的信息
>    getPackageJSON(pkgName)
>    
>    //基本插件（如下）都可以在这个方法中调用，然后在配置的时候直接调用这个方法
>    getBaseRollupPlugins(),返回一个数组，每个数组元素都调用一个插件
>    import ts from 'rollup-plugin-typescript2';
>    import cjs from '@rollup/plugin-commonjs';
>    import replace from '@rollup/plugin-replace';
>    //让打包后的产物中自动生成packages.json
>    import generatePackageJson from 'rollup-plugin-generate-package-json';
>    
>    ```
>
> 2.测试打包产物有效性
>
> ```js
> 步骤：
> 1.将我们打包的react包 通过pnpm link --global 和全局node_modules中的react包关联
> 2.在我们测试用的Demo项目中通过 pnpm link react --global  让引用的react包不是下载下来的，而是本地全局我们自己打包的react包
> 3.打印react中的jsx方法，看有无我们自己的版本号，有则是我们自己写的包且被运用到项目中了。
> 
> ```

## Reconciler架构

>**reconciler`是`React`核心逻辑所在的模块，中文名叫`协调器`。协调（reconcile）就是`diff算法的意思。**

>**前端框架结构与工作原理（状态驱动）:运行时核心模块消耗描述UI的方法，再去调用宿主环境的API，最终显示真实UI**
>
>![reconciler工作流](/Users/xxy/Pictures/reconciler工作流.png)
>
>```js
>vue solid  Next都有编译优化，而react没有。
>
>JSX方法会生成ReactElement这种数据结构，但是还是不能很好被核心模块操作，所以引入了FiberNode这种数据结构
>
>开发者编写的JSX代码，会通过bebal编译，转换为_jsx方法的执行，被_jsx(type，key，props)方法调用，生成ReactElement数据结构
>
>//JSX数据结构： <div><div>
>
>//ReactElemrnt数据结构：
>const element = {
>		$$typeof: REACT_ELEMENT_TYPE,
>		type,
>		key,
>		ref,
>		props,
>		__mark: 'XXY'
>	};
>缺陷：无法表达节点间的关系，无法表达状态。
>
>//FiberNode数据结构：
>优点：可以表达节点间的关系。不仅是存储单元，还是工作单元
>
>//DOMElement
>Fiber树生成后，会调用宿主环境API，直接操作DOMElement，从而改变视图
>```
>
>**reconciler工作流**
>
>1. 消费JSX，比较JSX返回的ReactElemrnt与FiberNode两种数据结构，生成WIP FiberNode树,树中根据比较的结果生成不同标记（插入、删除、移动......
>1. FiberNode树有两条，一条为current FiberNode树，代表目前的视图UI。一条为WorkInProgress FiberNode树。
>1. FiberNode树携带者

>**reconciler消费JSX顺序**
>
>```js
>以DFS（深度优先遍历）的顺序遍历ReactElement
>
>//这是个递归的过程，存在递、归两个阶段：
>递：对应beginWork,
>归：对应completeWork
>
>大致流程：
>1.触发更新后，将wip指向根节点，开始workLoop循环工作。
>2.workLoop中判断wip是否存在，存在就继续执行performUnitOfWork()计算Fiber
>3.performUnitOfWork中beginWork()开始 递,直到beginWork无next节点返回，则开始执行completeUnitOfWork开始 归
>4.completeUnitOfWork中执行completeWork 归,
>```
>
>

## 状态更新机制

> **挂载更新流程**
>
> 1. 创建整个应用的根节点（FiberRootNode），并将其与hostRootFiber连接起来
>
> 2. 实现updateContainer，创建updatequeue数据结构和update数据结构，并接入渲染机制，执行scheduleUpdateOnFiber
>
> 3. 找到根节点FiberRootNode，并根据根节点找到hostRootFiber，并生成hostRootFiber的WIP
>
> 4. 开始更新的流程workloop（递+归）
>
>    ![img](/Users/xxy/Documents/markdown/面经总结.assets/1.png)
>
> ```js
> //根组件挂载时ReactDOM.createRoot(rootElement).render(<App/>)
> 1.createRoot方法是为了生成FiberRootNode根节点，传入的参数是rootElement。
> 2.rootElement这个DOM对应的Fiber是hostRootFiber
> 3.<App/>这个jsx对应的Fiber就是一般的Fiber。
> 
> ```
>
> 

> 状态更新的三种情况
>
> * `ReactDOM.createRoot().render`（或老版的`ReactDOM.render`）
> * this.setState
> * `useState`的`dispatch`方法
>
> 更新机制：更新函数都是从根节点深度遍历开始的，但是第二、三种方法都是任意节点开始，所以为了兼容，要先向上遍历到根节点，在从根节点开始beginWork
>
> 
>
> 在tsconfig中的解析器里添加path，可以设置路径解析，将hostconfig解析为某一个目录下的某个文件





## react内部3个阶段 ##

1. schedule阶段

   ```js
   
   ```

2. render阶段（beginWork  completeWork）

   ```js
   
   ```

3. commit阶段（commitWork = beforeMutataion+mutation+layout阶段）

   ```js
   commit阶段分为3个子阶段
   
   layout阶段就是useLayoutEffect这个hooks进行的阶段
   ```

## 实现beginWork



## 实现completeWork ##

1. ###### 生成离屏DOM树，为了性能优化，多个placement合并成一个。 ######

```js

```



## 批处理 ##

1. 什么是批处理

   **多次触发更新，只进行一次更新流程**

2. 更新到底是同步还是异步？

   `React`更新采用批处理机制，批处理都是异步的，但触发的时机既有宏任务，也有微任务。

```js
1.setState一般情况下是在异步的微任务中执行
2.在react18的并发处理中，则是在宏任务中执行  const [isPending,startTransition] = useTransition()
startTransition(()=>{
  setCount(count++)
  setCount(count++)
  setCount(count++)			//此时触发的更新即为批处理。触发时机在宏任务期间
})

3.为了实现react批处理，react在render、commit阶段，新增了一个调度阶段schedule

schedule ---- render  ---- commit

schedule：
a.调度更新优先级，通过lane模型（lane和lanes）判断更新优先级。
b.transition并发更新就是相当于降低了内部更新的优先级。内部如果有setState，会被放在宏任务阶段执行。

render：实现FiberNode树的计算。

commit：提交计算所得FiberNode树，映射成UI



```





## useEffect流程 ##

1. render阶段对副作用进行收集存储到对应的FC fiberNode上

2. commit 阶段调度副作用，收集副作用的回调。此时需要使用scheduler（调度器）

   ```js
   回调有两类：create回调、destory回调
   
   unmout时执行的destroy回调
   update时执行的create回调
   
   本次更新的任何create回调都必须在所有上一次更新的destroy回调执行完后再执行。
   
   执行副作用的流程：
   1.遍历effect
   2.首先触发所有unmount effect，且对于某个fiber，如果触发了unmount destroy，本次更新不会再触发update create
   3.触发所有上次更新的destroy
   4.触发所有这次更新的create
   ```

   

3. 执行副作用
