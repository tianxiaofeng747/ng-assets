<a name="2.1.9"></a>
# 2.1.9 (2016-1-16)

### 功能更新
- 更新头部样式适应小屏幕
> 主要修改文件  `gulpfile.js` 和 `dashboard.less` 新增关于ie文件
> 今天遇到0宽字符串妨碍json 解析，打补丁，把‘此字符’换成空字符。（2016-1-28）
- 目录说明
1. `src` 源码文件夹
2. `version` 版本目录
3. `gulpfile` gulp 入口配置文件

<a name="2.1.8"></a>
# 2.1.8 (2015-12-28)

### 功能更新
- 尝试让核心文件支持ie8+
- 更改gulp发布文件，方便调试
> 主要修改文件  `gulpfile.js` 和 `dashboard.js` 新增关于ie文件
- 目录说明
1. `src` 源码文件夹
2. `version` 版本目录
3. `gulpfile` gulp 入口配置文件

<a name="2.1.7"></a>
# 2.1.7 (2015-12-04)

### 功能更新
- 主要更新整体样式问题，核心代码未变
- 头部和左侧样式修改，个人头像增加下拉菜单。颜色微调
> 主要修改文件  `dashboard.html` 和 `dashboard.less`
- 目录说明
1. `src` 源码文件夹
2. `dist` 项目生成文件
3. `gulpfile` gulp 入口配置文件

<a name="2.1.4"></a>
# 2.1.4 (2015-11-04)

### 功能更新
- 添加头部联系方式
- 添加gulp构建功能，主要负责编辑，压缩，打包文件。
> 主要修改文件  `dashboard.html` 和 `dashboard.less` 增加目录  `dist和src`
- 目录说明
1. `src` 源码文件夹
2. `dist` 项目生成文件
3. `gulpfile` gulp 入口配置文件

<a name="2.1.3"></a>
# 2.1.3 (2015-10-15)

### bug修复
- 在`dashboard.js`中加入修复代码
> 用于修复学期id 偶尔获取不到的情况
```javascript
-666 line -
IGrow.User.semesterid = IGrow.semesterid = this.current.id
-677 line-
//fix semesterid invalid
IGrow.User.semesterid = IGrow.User.semesterid || IGrow.semesterid ;
delete IGrow.semesterid
```


<a name="2.1.2"></a>
# 2.1.2 (2015-10-15)

### 功能改进
- 在`$api._dashboard_user.get`接口请求中添加参数
> 用于获取教师信息
```javascript
{
    _relatedfields: 'school.teacher.*'
}
```

<a name="2.1.1"></a>
# 2.1.1 (2015-09-22)

### 增加功能
- 增加侧边栏可以收缩，优化窄屏浏览器的显示

<a name="2.1.0"></a>
# 2.1.0 (2015-09-16)

### 增加功能
- 增加 'embed' 指令，加入优酷账号相关ID，通过已购买的优酷服务以去除播放时出现的广告

### 性能改进
- viewMask控制移到路由切换时控制
- 模板中对本插件的文件调用不再使用固定版本号，改成{version}，便于PHP读取模板动态替换版本号，省去了在模板中手动修改版本号的问题，直接在PHP调用时动态修改对应的版本号

<a name="2.0.0"></a>
# 2.0.0 (2015-08-10)

### 版本更新
- 重构核心代码, 模板重新回归html格式, 不再依赖.php绑定(可由.php调用), 详见源码
- html模板布局重构, 调用 todc-bootstrap UI框架, 具体参见(Issue [#WSCH-1562](http://jira.igrow.cn/browse/WSCH-1562))
- 加入jquery.slimscroll插件, 美化滚动条效果
- 加入font-awesome字体图标, 美化图标样式
- 更改默认配置方式, 具体参数详见源代码
- 取消semester扩展文件, 具体代码移到核心代码中, 暂时以固定参数'YO'为启用条件, 后期可自行更改
- 早期参数有变动
```
$scope.appData
$scope.schoolData
$scope.semesterData
$scope.modules (已取消)
$scope.menuData
```
- 将 '$scope' 改为 'this', html绑定改用 'controller as', 相关data参数继承于 'IGrow.Data' 中
- 更改 extra.js 文件中的'tips'函数, 加入Messenger组件并自定义扩展部分方法, 详见源码
- 取消 'loader' 服务, 更名为 'lazyLoad', 仅提供 css, js 加载

<a name="1.5.7"></a>
# 1.5.7 (2015-07-08)

### 性能改进
- 改进 `datetimepicker` 指令（基于 `bootstrap-datetimepicker` 2.3.4 版本），
  更友好的支持原插件配置扩展，额外加入 `event-` 事件的扩展，可独立支持 `angularJS` 的事件

<a name="1.5.6"></a>
# 1.5.6 (2015-06-25)

### Bug修复
- (Issue [#WSCH-1505](http://jira.igrow.cn/browse/WSCH-1505)) 修复无权限时，
  任继续跳转到用户上一次访问的路由地址的问题

### 性能改进
- 改进 `extpath` 函数，采用正则判断，路径自动补全功能
- 改进配置扩展/* preload extend */
- 取消 `http://auth.igrow.cn/auth/login`, `http://auth.igrow.cn/auth/logout` 跳转地址前的域名，
  改为当前域名 `/auth/login`, `/auth/logout`
