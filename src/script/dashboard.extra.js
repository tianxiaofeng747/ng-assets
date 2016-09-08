'use strict';

/*  extra  */
(function (app) {

    /*  pager  */
    app.factory('pager', ['$timeout', function ($timeout) {
        return function (page, callback) {
            if (!page) return null;
            var calculate = function (a, b, c) {
                c = c || (a > b ? a % b : 0);
                return Math.max(1, (a - c) / b + (c ? 1 : 0))
            };
            return angular.extend([], angular.extend({
                pagesize: 15,
                total: 0,
                split: 5,
                index: page.page || 1,
                selected: page.page || 1,
                prevName: '<i class="icon-chevron-left"></i>',
                nextName: '<i class="icon-chevron-right"></i>',
                click: function (item) {
                    if (typeof item === 'object') {
                        if (item.index === this.index) return this;
                        if (item.prev || item.next) {
                            this.index += item.prev ? -1 : 1
                        } else if (item.first || item.last) {
                            this.index = item.first ? 1 : this.nums
                        } else {
                            this.index = item.index
                        }
                    } else if (/^[0-9]*$/.test(Math.abs(parseInt(item)))) {
                        if ((item = parseInt(item)) === this.index) return this;
                        this.index = item
                    } else {
                        return this
                    }
                    //this.page !==
                    (item = this.apply()).index && angular.forEach(this.callback, function (fn) {
                        fn instanceof Function && setTimeout(function () {
                            angular.forEach('index|selected|page|pagesize|split'.split('|'), function (key) {
                                item[key] = Math.max(parseInt(item[key] || 1), 1)
                            });
                            fn(item);
                        })
                    });
                    this.loading = item.index;
                    return this
                },
                apply: function () {
                    if (!this.nums) {
                        this.nums = calculate(this.total, this.pagesize);
                        this.rows = calculate(this.nums, this.split);
                        this.callback = this.callback ? (this.callback instanceof Array ? this.callback : [this.callback]) : [];
                        callback instanceof Array ? (this.callback = this.callback.concat(callback)) : (callback && this.callback.push(callback))
                    }
                    this.index = this.selected = this.page = Math.max(1, Math.min(this.index, this.nums));
                    this.row = Math.min(calculate(this.index, this.split), this.rows);
                    this.splice(0);
                    if (this.index > 1) {
                        this[0] = {
                            index: this.prevName,
                            selected: this.index - 1,
                            prev: true
                        }
                    }
                    if (this.row > 1) {
                        this[1] = {
                            index: '1...',
                            selected: 1,
                            first: true
                        }
                    }
                    for (var i = (this.row - 1) * this.split + 1; i <= Math.min(this.row * this.split, this.nums) ; i++) {
                        this[this.length] = {
                            index: i,
                            selected: i,
                            num: true,
                            active: this.index === i
                        }
                    }
                    if (this.row < this.rows) {
                        this[this.length] = {
                            index: '...' + this.nums,
                            selected: this.nums,
                            last: true
                        }
                    }
                    if (this.index < this.nums) {
                        this[this.length] = {
                            index: this.nextName,
                            selected: this.index + 1,
                            next: true
                        }
                    }
                    return this
                }
            }, page)).apply()
        }
    }]);

    /*  pagination - <div pagination="data.extra"></div>  */
    app.directive('pagination', ['$compile', '$timeout', function ($compile, $timeout) {
        return {
            restrict: 'A',
            require: '?ngModel',
            template: function (element, attrs) {
                if (attrs.pagination) {
                    var dom = [], model = attrs.pagination;
                    dom.push('<ul>');
                    dom.push('<li ng-repeat="page in ' + model + '" ng-class="{true:\' active\'}[page.active]+{true:\' loading\'}[page.index===' + model + '.loading]" ng-click="' + model + '.click(page)">');
                    dom.push('<a href="javascript:void(0)" ng-bind-html="page.index"></a>');
                    dom.push('</li>');
                    dom.push('<li ng-show="' + model + '.total">');
                    dom.push('<span>');
                    dom.push('每页<b class="text-info" ng-bind="' + model + '.pagesize"></b> ');
                    dom.push('<a href="javascript:void(0)" data-toggle="popover" ng-click="' + model + '.__pagesize=' + model + '.pagesize"><i class="icon-cog"></i></a>');
                    dom.push('</span>');
                    dom.push('</li>');
                    dom.push('<li ng-if="' + model + '.total"><span>总计<b class="text-info" ng-bind="' + model + '.total"></b></span></li>');
                    dom.push('</ul>');
                    dom.push('<span ng-if="' + model + '.rows>1" class="input-append">第 <input type="text" class="input-small text-right" ng-keydown="$event.keyCode===13&&' + model + '.click(' + model + '.selected)" ng-model="' + model + '.selected" style="width:35px" /> 页');
                    dom.push('<a ng-if="' + model + '.rows>1" href="javascript:void(0)" class="btn" ng-click="' + model + '.click(' + model + '.selected)"><i class="icon-arrow-right"></i></a>');
                    dom.push('</span>');
                    element.addClass('pagination form-inline').attr('data-popover-container', parseInt(Math.random() * 10000)).html(dom.join(''));
                }
            },
            link: function (scope, element, attrs) {

                if (attrs.pagination) {

                    var model = attrs.pagination,
                        toggle = element.find('[data-toggle=popover]'),
                        random = parseInt(element.attr('data-popover-container')) || 0,
                        popoverHide = function () { toggle.popover('hide') },
                        _event = [];

                    _event.push(model + '.pagesize!==' + model + '.__pagesize');
                    _event.push('&&(' + model + '.pagesize=' + model + '.__pagesize)');
                    _event.push('&&' + model + '.click(-1)');

                    toggle.popover({
                        html: true,
                        placement: 'top',
                        container: '[data-popover-container=' + random + ']',
                        content: '<span class="input-append"><input type="text" class="input-small text-right" ng-keydown="$event.keyCode===13&&' + _event.join('') + '" ng-model="' + model + '.__pagesize" style="width:35px" /><a href="javascript:void(0)" class="btn" ng-click="' + _event.join('') + '"><i class="icon-ok-sign"></i></a></span>'
                    }).on('shown', function () {
                        var $popover = element.children('.popover');
                        /*  prevents propagation of an event beyond the current target for popover  */
                        $popover.click(function () { return false });
                        /*  popover hide  */
                        $popover.mouseleave(popoverHide);
                        $popover.find('span[class=input-append]>input[type=text]').keydown(function (event) { event.keyCode === 13 && popoverHide() });
                        $popover.find('span[class=input-append]>a[class=btn]').click(popoverHide);
                        /*  compile popover  */
                        $timeout(function () { $compile($popover)(scope) });
                    });
                    /*  prevents propagation of an event beyond the current target for toggle  */
                    toggle.click(function () { return false });
                    /*  popover hide  */
                    $(document).click(popoverHide);

                }

            }
        }
    }]);

    /*  form tips  */
    app.directive('formTips', ['tips', function (tips) {
        return {
            restrict: 'A',
            require: 'form',
            link: function (scope, element, attrs, ctrl) {
                var form = element[0], $ctrl, $data, $error, $config = {};
                if (form && form.name && form.tagName === 'FORM' && ($ctrl = scope[form.name])) {
                    form.noValidate = true;
                    element.submit(function (event, stop) {
                        if (ctrl.$invalid) {
                            angular.forEach(form, function (elem) {
                                if (stop) return;
                                elem && elem.name
                                && $ctrl[elem.name]
                                && ($error = $ctrl[elem.name].$error)
                                && elem.dataset
                                && elem.dataset.tipsConfig
                                && eval('$config=' + elem.dataset.tipsConfig)
                                && angular.forEach($error, function (bool, key) {
                                    if (bool) {
                                        tips.warning($config[key]);
                                        $(elem).removeClass('ng-pristine').addClass('ng-dirty');
                                        stop = true
                                    }
                                })
                            });
                            event.stopImmediatePropagation()
                        }
                        return false
                    });
                    $data = $.data(form, 'events') || $._data(form, 'events');
                    $data && $data.submit.unshift($data.submit.pop());
                }
            }
        }
    }]);

    /*  validator integer - <input type="text" ng-model="data.number" integer /> (ng-model必填，否则该功能不生效)  */
    app.directive('integer', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.integer = true;
                var validator = function (value) {
                    if (attr.integer && !!value && !(/^\-?\d*$/.test(value))) {
                        ctrl.$setValidity('integer', false);
                        return
                    }
                    ctrl.$setValidity('integer', true);
                    return value
                };
                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);
                attr.$observe('integer', function () { validator(ctrl.$viewValue) })
            }
        }
    });

    /*  validator mobile - <input type="text" ng-model="data.mobile" mobile /> (ng-model必填，否则该功能不生效)  */
    app.directive('mobile', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.mobile = true;
                var validator = function (value) {
                    if (attr.mobile && !!value && !(/^1[3|4|5|7|8]\d{2}(\d{4}|\*{4})\d{3}$/.test(value))) {
                        ctrl.$setValidity('mobile', false);
                        return
                    }
                    ctrl.$setValidity('mobile', true);
                    return value
                };
                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);
                attr.$observe('mobile', function () { validator(ctrl.$viewValue) })
            }
        }
    });

    /*  datetimepicker - <input type="text" ng-model="data.datetimepicker" datetimepicker />  */
    app.directive('datetimepicker', ['$parse', '$q', '$timeout', 'lazyLoad', function ($parse, $q, $timeout, lazyLoad) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                $q.all([
                    lazyLoad.css('http://assets.haoyuyuan.com/vendor/plugins/bootstrap/bootstrap-datetimepicker/2.3.4/css/bootstrap-datetimepicker.min.css', true),
                    lazyLoad.js([
                        'http://assets.haoyuyuan.com/vendor/plugins/bootstrap/bootstrap-datetimepicker/2.3.4/js/bootstrap-datetimepicker.min.js',
                        'http://assets.haoyuyuan.com/vendor/plugins/bootstrap/bootstrap-datetimepicker/2.3.4/js/locales/bootstrap-datetimepicker.zh-CN.js'
                    ])
                ]).then(function () {

                    // get component element
                    var component = element.parent().addClass('date'),

                    // get picker element
                    picker = component.datetimepicker(angular.extend({
                        autoclose: true,
                        format: 'yyyy-mm-dd',
                        language: 'zh-CN',
                        pickerPosition: 'bottom-left'
                    }, element.data() || {})).data('datetimepicker').picker;

                    // replace the arrow icon
                    picker.find('.icon-arrow-left').replaceWith('<i class="icon-chevron-left"></i>');
                    picker.find('.icon-arrow-right').replaceWith('<i class="icon-chevron-right"></i>');

                    // execute the init event
                    attrs.eventInit && $parse(attrs.eventInit, null, true)(scope, { $event: null });
                    delete attrs.eventInit;

                    // execute the plugin event
                    angular.forEach(attrs, function (item, key, name) {
                        if (/^event/.test(key)) {
                            name = key.replace(/^event/, '').replace(/^\w/, function (v) { return v.toLowerCase() });
                            component.on(name, function (event) { $timeout(function () { $parse(attrs[key], null, true)(scope, { $event: event }) }) });
                        }
                    });

                })
            }
        }
    }]);

    /*  file-uploader - <form file-uploader="[callback]" action="[url]" enctype="multipart/form-data" method="post" target="iframe-file-uploader">[...]<iframe style="display:none" name="iframe-file-uploader"></iframe></form>  */
    app.directive('fileUploader', ['viewMask', 'tips', function (viewMask, tips) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var iframe = element.find('iframe').first(), uploading = false;
                if (iframe.length > 0) {
                    element.submit(function () {
                        var hasFile = false;
                        for (var name in this) {
                            if (this[name] && this[name].type && this[name].type.toLowerCase() === 'file' && this[name].value) {
                                hasFile = true
                            }
                        }
                        hasFile ? viewMask.open() : tips.warning('请选择需要提交的文件！');
                        uploading = true;
                        return hasFile
                    });
                    iframe.load(function () {
                        if (!uploading) return;
                        uploading = false;
                        var body = (iframe[0].contentDocument || iframe[0].contentWindow.document).body,
                            content = body.innerText || body.textContent,
                            reset = angular.element('<input type="reset" style="display:none" />');
                        try { content = $.parseJSON(content) } catch (ex) { try{ content = $.parseJSON(content.replace('​',''))} catch(ex){console && console.log('WARN: XHR response is not valid json [' + ex.message + ']')}}
                        return (function (callback) {
                            viewMask.close();
                            typeof content === 'object' && scope.$apply(function () {
                                scope.uploadCompleted = content;
                                callback && scope[callback.replace(/[^\w]/g, '')] && scope[callback.replace(/[^\w]/g, '')](content);
                                if (content.code === 0) {
                                    tips.success('导入成功！')
                                } else {
                                    if (content.data instanceof Array && content.data.length) {
                                        angular.forEach(content.data, function (item) { tips.error(item, 0) })
                                    } else {
                                        tips.error(content.message)
                                    }
                                }
                                element.append(reset);
                                reset.trigger('click');
                                reset.remove()
                            })
                        })(attr['fileUploader'])
                    })
                }
            }
        }
    }]);

    /*  modal-web-uploader  */
    app.directive('modalWebUploader', ['$compile', '$timeout', 'lazyLoad', 'tips', function ($compile, $timeout, lazyLoad, tips) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
                scope.$watch(attrs.modalWebUploader, function (opts) {
                    opts && lazyLoad.js([
                        'http://assets.haoyuyuan.com/vendor/plugins/igrow/webuploader/0.1.7/webuploader.igrow.min.js?v=20150525',
                        'http://assets.haoyuyuan.com/vendor/plugins/jquery/slimscroll/1.3.2/jquery.slimscroll.min.js?v=20150525'
                    ], function () {



                        //////////////////////////////////////
                        ///           WebUploader          ///
                        //////////////////////////////////////
                        if (!WebUploader.Uploader.support()) {
                            alert('您的浏览器不支持上传功能！');
                            throw new Error('WebUploader does not support the browser you are using.');
                        }

                        //部件存放
                        opts.widgets = opts.widgets || {};

                        //添加按钮样式
                        element.addClass('webuploader-button');

                        //调整file控件位置
                        var resetInput = function () {
                            $timeout(function () {

                                var input = element.find('input[type=file]').first(),
                                    parent = input.parent();

                                element.append(input);
                                parent.remove();

                                //按钮事件
                                element.click(function (event) {
                                    opts.widgets.WebUploader.isInProgress() ? event.preventDefault() : opts.expand(false)
                                });

                            })
                        };

                        //如果对象已存在，则添加按钮，不再重新初始化
                        if (opts.widgets.WebUploader) {
                            opts.widgets.WebUploader.addButton({ id: element });
                            resetInput();
                            return;
                        }

                        //默认配置
                        var config = {
                            pick: {
                                id: element,
                                multiple: true,
                                //capture: 'camera',
                                configkey: 'default_asset'
                            },
                            accept: {
                                //可自定义格式
                                extensions: '*',
                                mimeTypes: '*'
                            },
                            auto: false,
                            disableGlobalDnd: true,
                            prepareNextFile: true,
                            chunked: true,
                            chunkRetry: 0,
                            threads: 10,
                            //fileNumLimit: 12,
                            fileSingleSizeLimit: 10 * 1024 * 1024,
                            duplicate: true,
                            thumb: {
                                width: 60,
                                height: 60,
                                // 图片质量，只有type为`image/jpeg`的时候才有效。
                                quality: 80,
                                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                                allowMagnify: false,
                                // 是否允许裁剪。
                                crop: true,
                                // 为空的话则保留原有图片格式。
                                // 否则强制转换成指定的类型。
                                type: 'image/jpeg'
                            },
                            compress: {
                                //width: 1600,
                                //height: 1600,
                                // 图片质量，只有type为`image/jpeg`的时候才有效。
                                quality: 80,
                                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                                allowMagnify: false,
                                // 是否允许裁剪。
                                crop: false,
                                // 是否保留头部meta信息。
                                preserveHeaders: true,
                                // 如果发现压缩后文件大小比原来还大，则使用原来图片
                                // 此属性可能会影响图片自动纠正功能
                                noCompressIfLarger: false,
                                // 单位字节，如果图片大小小于此值，不会采用压缩。
                                compressSize: 200 * 1024
                            }
                        };

                        //先将config中object键值提出来，以免后面的extend将其覆盖，因为该函数无法实现递归覆盖
                        angular.forEach(config, function (value, key) {
                            if (angular.isObject(value) && angular.isObject(this[key])) {
                                this[key] = angular.extend(value, this[key])
                            }
                        }, opts.config.uploader = opts.config.uploader || {});

                        //应用配置
                        config = angular.extend(config, opts.config.uploader);

                        //上传插件对象由 this.WebUploader 获得
                        opts.widgets.WebUploader = WebUploader.create(config);

                        resetInput();



                        //////////////////////////////////////
                        ///              modal             ///
                        //////////////////////////////////////
                        var formatSize = function (size, index, unit) {
                            index = index || 2;
                            unit = unit || ['B', 'KB', 'MB', 'GB', 'TB'];
                            if (!size) return size + unit[index];
                            while (index < unit.length && size / Math.pow(1024, index) >= 1) { index++ }
                            return Math.round(size / Math.pow(1024, index - 1) * Math.pow(10, 2)) / Math.pow(10, 2) + unit[index - 1]
                        },
                        //文件类型
                        $exts = {
                            pic: ['bmp', 'gif', 'jpg', 'jpeg', 'png'],
                            pdf: ['pdf'],
                            doc: ['doc', 'docx'],
                            xls: ['xls', 'xlsx'],
                            txt: ['txt'],
                            audio: ['cda', 'mid', 'mp3', 'wav', 'wma'],
                            video: ['avi', 'flash', 'mp4', 'rmvb', 'rm', 'swf'],
                            exe: ['exe'],
                            zip: ['7z', 'rar', 'zip'],
                            psd: ['psd'],
                            ai: ['ai']
                        },
                        $errors = {
                            ERROR_TOKEN_GET: '服务器出错',
                            //F_EXCEED_SIZE: '上传文件体积过大（限制：' + formatSize(config.fileSingleSizeLimit) + '）',
                            Q_EXCEED_SIZE_LIMIT: '上传文件总体积过大（限制：' + (config.fileNumLimit * formatSize(config.fileSingleSizeLimit)) + '）',
                            Q_EXCEED_NUM_LIMIT: '上传文件数量过多（限制：' + config.fileNumLimit + '）'
                        },
                        $event = {
                            fileQueued: function (file) {
                                angular.forEach($exts, function (item, name) { if (item.indexOf(file.ext.toLowerCase()) > -1) { file.extClass = '-' + name } });
                                file.sizeText = formatSize(file.size || 0);
                                file.status = 0;
                                opts.queued.push(file);
                            },
                            filesQueued: function () {
                                opts.widgets.modal.show();
                                opts.expand(true);
                                opts.traversal(opts.status = 0);
                            },
                            fileDequeued: function () {
                                opts.traversal();
                            },
                            startUpload: function () {
                                opts.status = 1;
                                element.addClass('disabled');
                            },
                            uploadStart: function (file) {
                                file.status = -1;
                                file.statusText = '0%';
                            },
                            uploadProgress: function (file, progress) {
                                file.statusText = Math.max(0, Math.min(100, parseInt(progress * 100))) + '%';
                            },
                            uploadSuccess: function (file, response) {
                                file.status = 1;
                                file.statusText = '100%';
                                opts.traversal();
                            },
                            uploadError: function (file, response) {
                                file.status = 2;
                                file.statusText = response && response.message || '上传失败';
                            },
                            uploadComplete: function () {
                                opts.traversal();
                            },
                            uploadFinished: function () {
                                opts.status = 2;
                                opts.automini && opts.expand(false);
                                element.removeClass('disabled');
                                $('span[data-toggle=tooltip]').tooltip('show');
                            },
                            error: function (type, file, response) {

                                // `Q_EXCEED_NUM_LIMIT` 在设置了`fileNumLimit`且尝试给`uploader`添加的文件数量超出这个值时派送。
                                // `Q_EXCEED_SIZE_LIMIT` 在设置了`Q_EXCEED_SIZE_LIMIT`且尝试给`uploader`添加的文件总大小超出这个值时派送。
                                // `Q_TYPE_DENIED` 当文件类型不满足时触发。。
                                // `F_EXCEED_SIZE` 文件过大
                                if ($errors[type]) {
                                    tips.error($errors[type], function () {
                                        element.removeClass('disabled');
                                        opts.traversal(opts.status = 0);
                                    })
                                } else {
                                    if (file && file.name) {
                                        var message = response && response.message || '上传失败';
                                        switch (type) {
                                            case 'F_EXCEED_SIZE':
                                                message = '文件过大（限制：' + formatSize(config.fileSingleSizeLimit) + '）';
                                                break;
                                            case 'Q_TYPE_DENIED':
                                                message = '文件类型错误（例：' + config.accept.extensions + '）';
                                                break;
                                        }
                                        file.status = 2;
                                        file.statusText = message;
                                    }
                                    element.removeClass('disabled');
                                    opts.traversal(opts.status = 0);
                                }

                            }
                        };

                        //遍历并绑定内部上传事件
                        angular.forEach($event, function (fn, key) {
                            this.on(key, function () {
                                var _this = this, _arguments = arguments;
                                $timeout(function () { fn.apply(_this, _arguments) });
                            })
                        }, opts.widgets.WebUploader);

                        //遍历并绑定外部上传事件
                        angular.forEach(opts.events, function (fn, key) {
                            this.on(key, function () {
                                var _this = this, _arguments = arguments;
                                $timeout(function () { fn.apply(_this, _arguments) });
                            })
                        }, opts.widgets.WebUploader);

                        //modal操作
                        opts.$modal = angular.extend({
                            status: -1,// -1：选择文件，0：等待上传，1：正在上传，2：上传完成
                            succeed: 0,
                            queued: [],
                            automini: true,
                            maximize: true,
                            expand: function (bool) {

                                opts.maximize = bool;

                                opts.widgets.modal.children('.modal-body').stop()
                                    .animate({
                                        height: bool ? 296 : 0
                                    }, 200, function () {
                                        opts.widgets.tabbable.slimScroll({ width: 600, height: 258, alwaysVisible: true });
                                    });

                                opts.widgets.modal.children('.modal-footer').stop()
                                    .animate({
                                        height: bool ? 30 : 0,
                                        paddingTop: bool ? 5 : 0,
                                        paddingBottom: bool ? 5 : 0,
                                        borderTopWidth: bool ? 1 : 0
                                    }, 200);

                            },
                            remove: function (index) {
                                opts.widgets.WebUploader.removeFile(opts.queued[index].id);
                                opts.queued.splice(index, 1);
                                opts.traversal();
                            },
                            traversal: function (callback) {
                                var isnull = true;
                                opts.succeed = 0;
                                angular.forEach(opts.queued, function (item) {
                                    if (item.status === 0) { isnull = false }
                                    if (item.status === 1) { opts.succeed++ }
                                });
                                if (isnull) { opts.status = -1 }
                                (callback || angular.noop).apply(opts);
                            },
                            submit: function () {
                                opts.widgets.WebUploader.upload()
                            },
                            close: function () {
                                opts.widgets.modal.hide();
                                opts.widgets.modal.children('.modal-body').removeAttr('style');
                                opts.widgets.modal.children('.modal-footer').removeAttr('style');
                                element.removeClass('disabled');
                                angular.forEach(opts.queued, function (item) { opts.widgets.WebUploader.removeFile(item) });
                                opts.widgets.WebUploader.reset();
                                opts.expand(false);
                                opts.status = -1;
                                opts.succeed = 0;
                                opts.queued = [];
                            }
                        }, opts.config.modal || {});

                        //重新设置参数并删除配置值
                        angular.extend(opts, opts.$modal);
                        delete opts.$modal;
                        delete opts.config;
                        delete opts.events;

                        !opts.widgets.modal && (function (html) {

                            html.push('<div class="modal hide web-uploader">');
                            html.push('<div class="modal-header">');
                            html.push('<h3>');
                            html.push('<span ng-if="' + attrs.modalWebUploader + '.status===-1">请选择文件</span>');
                            html.push('<span ng-if="' + attrs.modalWebUploader + '.status===0"><i class="icon-white icon-check"></i> 等待上传 ({{' + attrs.modalWebUploader + '.succeed}}/{{' + attrs.modalWebUploader + '.queued.length}})</span>');
                            html.push('<span ng-if="' + attrs.modalWebUploader + '.status===1"><i class="icon-white icon-upload"></i> 正在上传... ({{' + attrs.modalWebUploader + '.succeed}}/{{' + attrs.modalWebUploader + '.queued.length}})</span>');
                            html.push('<span ng-if="' + attrs.modalWebUploader + '.status===2"><i class="icon-white icon-list"></i> 上传完成</span>');
                            html.push('</h3>');
                            html.push('<div class="pull-right">');
                            html.push('<a href="javascript:void(0)" class="icon-white icon-resize-small" ng-if="' + attrs.modalWebUploader + '.maximize" ng-click="' + attrs.modalWebUploader + '.expand(false)"></a>');
                            html.push('<a href="javascript:void(0)" class="icon-white icon-resize-full" ng-if="!' + attrs.modalWebUploader + '.maximize" ng-click="' + attrs.modalWebUploader + '.expand(true)"></a>');
                            html.push('<a href="javascript:void(0)" class="icon-white icon-remove" ng-click="' + attrs.modalWebUploader + '.close()"></a>');
                            html.push('</div>');
                            html.push('</div>');
                            html.push('<div class="modal-body">');
                            html.push('<table class="table">');
                            html.push('<thead>');
                            html.push('<tr>');
                            html.push('<th style="text-align:left;">标题</th>');
                            html.push('<th style="text-align:right;">大小</th>');
                            html.push('<th style="width:50px;">状态</th>');
                            html.push('<th style="width:50px;">操作</th>');
                            html.push('</tr>');
                            html.push('</thead>');
                            html.push('</table>');
                            html.push('<div class="tabbable">')
                            html.push('<table class="table table-hover">');
                            html.push('<tbody>');
                            html.push('<tr ng-repeat="(index,item) in ' + attrs.modalWebUploader + '.queued">');
                            html.push('<td><i class="typesicon{{item.extClass}}"></i> {{item.name}}</td>');
                            html.push('<td style="text-align:right;" ng-bind="item.sizeText"></td>');
                            html.push('<td style="width:50px;text-align:center;">');
                            html.push('<span ng-if="item.status===0">等待</span>');
                            html.push('<span ng-if="item.status===-1||item.status===1" ng-bind="item.statusText"></span>');
                            html.push('<span class="label label-important" data-toggle="tooltip" data-placement="left" title="{{item.statusText}}" ng-if="item.status===2"><i class="icon-white icon-warning-sign" style="margin-top:0;"></i></span>');
                            html.push('</td>');
                            html.push('<td style="width:50px;text-align:center;">');
                            html.push('<i class="uploading" ng-if="item.status===-1"></i>');
                            html.push('<a href="javascript:void(0)" class="icon-remove" ng-if="item.status===0" ng-click="' + attrs.modalWebUploader + '.remove(index)"></a>');
                            html.push('<i class="icon-ok-circle" ng-if="item.status===1"></i>');
                            html.push('</td>');
                            html.push('</tr>');
                            html.push('</tbody>');
                            html.push('</table>');
                            html.push('</div>');
                            html.push('</div>');
                            html.push('<div class="modal-footer">');
                            html.push('<a href="javascript:void(0)" class="btn btn-primary disabled" ng-if="' + attrs.modalWebUploader + '.status!==0">开始上传</span>');
                            html.push('<a href="javascript:void(0)" class="btn btn-primary" ng-if="' + attrs.modalWebUploader + '.status===0" ng-click="' + attrs.modalWebUploader + '.submit()">开始上传</span>');
                            html.push('</div>');
                            html.push('</div>');

                            $('div[ng-view]').append(opts.widgets.modal = $(html.join('')));

                            $compile(opts.widgets.modal.contents())(scope);

                            opts.widgets.tabbable = opts.widgets.modal.children('.modal-body').children('.tabbable');

                        }([]));

                    })
                })
            }
        }
    }]);

    /*  embed convert for youku.com  */
    app.directive('embed', ['lazyLoad', function (lazyLoad) {
        return {
            restrict: 'E',
            link: function (scope, element, attrs, ctrl) {
                if (/^(http|https)\:\/\/player\.youku\.com/i.test(attrs.src)) {
                    var width = attrs.width || '100%',
                        height = attrs.height || 300,
                        exec = /(.+)?\/player\.php\/sid\/(.+)?\//i.exec(attrs.src) || [],
                        site = exec[1] || '',
                        vid = exec[2] || '';
                    //vid && element.replaceWith('<iframe width="' + width + '" height="' + height + '" src="' + site + '/embed/' + vid + '" frameborder="0" allowfullscreen></iframe>')
                    vid && !element.parent().attr('completed') && lazyLoad.js(site + '/jsapi', false).then(function ($divID) {
                        $divID = 'youkuplayer_' + new Date().valueOf();
                        element.replaceWith('<div id="' + $divID + '" completed="youkuplayer"></div>');

                        new YKU.Player($divID, {
                            client_id: '779850019d217f44',
                            vid: vid,
                            width: width,
                            height: height,
                            autoplay: false,
                            show_related: false
                        });
                    });
                }
            }
        }
    }]);

}(angular.module('dashboard.extra', [])));