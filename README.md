#About Dashboard

## 前端部分

- `dashboard.html`
    - 插件模版，基础布局，css，javascript 初始化所需插件加载均写在页面中
    - 引用地址中含有`{version}`关键字符的地址需要在php引用中动态替换版本号所用
    - `<!--[if IE 9]> ... <![endif]-->`为低版本IE浏览器兼容所用

- `dashboard.less`
    - 绑定模版中所需的样式，以及部份公共样式，采用less来便携样式

- `dashboard.js` (核心功能实现)

    - `$httpProvider.interceptors` http拦截器，使用promise有效
        - `request` 发起http请求，方法中可以动态调整参数
        - `requestError` http请求失败，通过reject返回错误信息
        - `response` 服务器请求成功，正常返回调用这该函数
        - `responseError` 服务器请求失败，可从回传参数中捕获错误信息

    - `moduleInjector` 模块注入
        - 动态加载的模块文件可以使用该方法注入模块，以实现模块间的依赖
        - 支持`String`或`Array`参数，参数为`angular.module`的`name`值

    - `routeApply` 路由配置，参见官方API说明文档
        - 支持异步加载css,js等文件
        - 支持动态请求数据（例如权限数据）
        - 自定义路由事件(before, after)，可设全局

    - `lazyLoad` 文件加载
        - 返回promise，便于依赖加载

    - `$api` API接口请求
        - 支持动态配置
        - url自动补全
        - 默认支持多个子操作如下：

        ```javascript
        get: { method: 'GET' },
        list: { method: 'GET' },
        search: { method: 'GET' },
        set: { method: 'POST' },
        create: { method: 'POST' },
        update: { method: 'POST' },
        remove: { method: 'POST' },
        delete: { method: 'POST' }
        ```

    - `viewAuth` 模块权限
        - 路由跳转时，根据相关权限配置去获取权限
        - `controller`中注入该服务，通过相关键值对去获取当前模块权限

    - `viewMask` 遮罩效果
        - http请求时自动触发，也可手动设置

    - `tips` 信息提示
        - 依赖于第三方插件`Messenger`
        - http请求反馈中触发，也可手动调用

    - `app.controller(app.name + '.controller'` 核心控制器
        - 初始化默认设置
        - 请求基础数据
        - 设置全局变量
        - 路由监控

- `dashboard.extra.js` 功能扩展
    - `factory`
        - `pager` 分页函数，可自定义参数

        ```javascript
        {
            pagesize: 15,
            total: 0,
            split: 5,
            index: page.page || 1,      //由page参数转换得到
            selected: page.page || 1,   //由page参数转换得到
            prevName: '<i class="icon-chevron-left"></i>',
            nextName: '<i class="icon-chevron-right"></i>'
        }
        ```

    - `directive`
        - `pagination` 分页指令，根据bootstrap生成相关分页UI，需套用`pager`分页函数来使用
        - `formTips` 表单提示，表单验证提示用，需调用`tips`来输出提示信息
        - `integer` 整数验证
        - `mobile` 手机号验证
        - `datetimepicker` 日期指令，基于bootstrap-datetimepicker插件，
            替换了arrow图标，加入eventInit事件
        - `fileUploader` form表单上传指令，通过iframe得到返回内容，并解析成对象
        - `modalWebUploader` webuploader上传指令，基于webuploader.igrow插件，
            该插件属于定制插件，具体参考指令源代码
        - `embed` 播放器指令，目前只解析优酷的播放链接，加入去除广告功能，
            动态绑定client_id(优酷中购买相关服务并设置站点后获得)

            ```javascript
            new YKU.Player($divID, {
                client_id: '779850019d217f44',
                vid: vid,
                width: width,
                height: height,
                autoplay: false,
                show_related: false
            })
            ```
## 后端部分

> 需要PHP(Laravel)框架中的路由指向到一下模版中即可

- `dashboard.blade.php`

    ```php
    <?php
    $ver = '2.1.1';
    $ch = curl_init('http://assets.haoyuyuan.com/vendor/plugins/igrow/dashboard/'.$ver.'/dashboard.min.html');
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
    //curl_setopt($ch,CURLOPT_TIMEOUT,5);
    $output = curl_exec($ch);
    if(curl_errno($ch)){
        echo 'Curl Error: ' . curl_error($ch);
    }else{
        echo str_replace('{version}',$ver,$output);
    }
    curl_close($ch);
    ?>
    ```
