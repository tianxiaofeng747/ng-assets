'use strict';

$(function (app, lazyLoad, routevalid, sidebar, ngView) {
    // slider toggle
    $(".sidebar-toggle").click(function(){
        var moveWidth = $("aside").width();
        if(!$(this).data("isOpen")){
            $("aside").animate({left:-moveWidth});
            $("header .title").animate({marginLeft:-moveWidth});
            $("section").animate({marginLeft:-moveWidth});
            $(this).addClass("closed").data("isOpen",true);
        }else{
            $("aside").animate({left:'0px'});
            $("header .title").animate({marginLeft:'0px'});
            $("section").animate({marginLeft:'0px'});
            $(this).removeClass("closed").data("isOpen",false);
        }
    });
    //IGrow to global
    window.IGrow = {
        Config: { timestamp: Date.parse(new Date()) / 1000 },
        Data: {
            app: [],
            school: [],
            semester: [],
            menu: []
        },
        Role: {},
        User: {},
        Log: {
            menu: {
                preset: '',
                module: '',
                element: ''
            }
        }
    };

    /*  lazy load  */
    lazyLoad = {
        cache: {},
        deferred: function (self) { return self.all ? self.defer() : $.Deferred() },
        promise: function (self, deferred) { return self.all ? deferred.promise : deferred.promise() },
        when: function (self, deferredList) { return self.all ? self.all(deferredList) : $.when.apply($, deferredList) },
        css: function (path) {

            var self = this,
                cache = lazyLoad.cache,
                deferred = lazyLoad.deferred(self),
                deferredList = [],
                callback,
                preload,
                $ua = navigator.userAgent;

            if (typeof arguments[1] === 'boolean') {
                callback = arguments[2];
                preload = arguments[1];
            } else {
                callback = arguments[1];
                preload = arguments[2];
            }

            angular.forEach(path instanceof Array ? path : [path], function (url, deferred, element) {
                deferred = cache[url] || lazyLoad.deferred(self);
                deferredList.push(lazyLoad.promise(self, deferred));
                if (!cache[url]) {
                    element = document.createElement('link');
                    element.rel = 'stylesheet';
                    if (preload) {
                        cache[url] = deferred
                    } else {
                        element.className = 'lazyLoad-stylesheet'
                    }
                    if (/(?:Android);?[\s\/]+([\d.]+)?/i.test($ua) || /(?:iPad|iPod|iPhone).*OS\s([\d_]+)/i.test($ua)) {
                        (function poll(count, loaded) {
                            if (/webkit/i.test($ua)) {
                                if (element.sheet) {
                                    loaded = true
                                }
                            } else if (element.sheet) {
                                try {
                                    if (element.sheet.cssRules) {
                                        loaded = true
                                    }
                                } catch (ex) {
                                    if (ex.name === 'SecurityError' || ex.code === 1000) {
                                        loaded = true
                                    }
                                }
                            }
                            if (loaded || (count >= 200)) {
                                deferred.resolve()
                            } else {
                                setTimeout(function () { poll(count + 1) }, 10)
                            }
                        }(0))
                    } else {
                        element[document.addEventListener ? 'onload' : 'onreadystatechange'] = function (_, isAbort) {
                            if (isAbort || !element.readyState || /loaded|complete/.test(element.readyState)) {
                                deferred.resolve()
                            }
                        }
                    }
                    element.onerror = function () { deferred.reject(url) };
                    element.setAttribute('charset', 'utf-8');
                    element.href = url + (!/\/(\d(\.\d+)+)\//.test(url) && !/\.css\?/.test(url) ? '?_' + IGrow.Config.timestamp : '');
                    (document.head || document.getElementsByTagName('head')[0]).appendChild(element);
                }
            });

            lazyLoad.when(self, deferredList).then(function () {
                setTimeout(callback || angular.noop);
                deferred.resolve();
            }, function () {
                deferred.reject();
                console.error('lazyLoad-css-error:', arguments[0]);
            });

            return lazyLoad.promise(self, deferred);

        },
        js: function (path) {

            var self = this,
                cache = lazyLoad.cache,
                deferred = lazyLoad.deferred(self),
                deferredList = [],
                loadList = [],
                boolean = typeof arguments[1] === 'boolean',
                callback = boolean ? false : arguments[1],
                timestamp = boolean && !arguments[1] ? '' : '?_' + IGrow.Config.timestamp;

            angular.forEach(path instanceof Array ? path : [path], function (url, deferred, element) {
                deferred = cache[url] || lazyLoad.deferred(self);
                deferredList.push(lazyLoad.promise(self, deferred));
                if (!cache[url]) {
                    cache[url] = deferred;
                    loadList.push(url);
                }
            });

            (function load(index, element, url) {
                if (url = loadList[index]) {
                    element = document.createElement('script');
                    element[document.addEventListener ? 'onload' : 'onreadystatechange'] = function (_, isAbort) {
                        if (isAbort || !element.readyState || /loaded|complete/.test(element.readyState)) {
                            document.body.removeChild(element);
                            cache[url].resolve();
                            load(index + 1);
                        }
                    };
                    element.onerror = function () {
                        cache[url].reject(url);
                        load(index + 1);
                    };
                    element.setAttribute('charset', 'utf-8');
                    element.src = url + (!/\/(\d(\.\d+)+)\//.test(url) && !/\.js\?/.test(url) ? timestamp : '');
                    document.body.appendChild(element);
                }
            }(0));

            lazyLoad.when(self, deferredList).then(function () {
                !boolean && setTimeout(callback || angular.noop);
                deferred.resolve();
            }, function () {
                deferred.reject();
                console.error('lazyLoad-js-error:', arguments[0]);
            });

            return lazyLoad.promise(self, deferred);

        }
    };

    /*  route validation  */
    routevalid = function (code, path) { return (new RegExp('^' + code.replace(/\./g, '\\.') + '(\\.|\\/|\\?|\\&|\\#|$)')).test(path) };

    /*  get sidebar  */
    sidebar = (function (sidebar) {
        return {
            collapse: function () {
                sidebar.children('.active').animate({ height: sidebar.children('.active').children('a').height() }, 300)
            },
            expand: function ($linkHeight, $listHeight) {
                $linkHeight = $linkHeight || sidebar.children('.active').children('a').height();
                $listHeight = $listHeight || sidebar.children('.active').children('ul').height();
                sidebar.children('.active').animate({ height: $linkHeight + $listHeight }, 300);
            }
        }
    })($('.sidebar').slimScroll({ height: '100%' }));

    /*  get ng-view  */
    ngView = $('.view-container').slimScroll({ width: '100%', height: '100%' });

    /*  app module  */
    app = angular.module('dashboard', ['ngResource', 'ngRoute', 'ngSanitize', 'dashboard.extra']);

    /*  app config  */
    app.config(['$animateProvider', '$compileProvider', '$controllerProvider', '$filterProvider', '$httpProvider', '$provide', '$routeProvider', function ($animateProvider, $compileProvider, $controllerProvider, $filterProvider, $httpProvider, $provide, $routeProvider) {

        /*  register the interceptor via an anonymous factory  */
        $httpProvider.interceptors.push(['$q', 'tips', 'viewMask', function ($q, tips, viewMask) {
            return {
                request: function (request) {
                    var $data = function (data) {

                        delete data.action;
                        delete data.dashboard_api_action;

                        angular.forEach(['automask', 'autotips'], function (key) {
                            request[key] = data[key] === undefined ? IGrow.Config[key] : data[key];
                            delete data[key];
                        });

                        if (!/\/api\/1.1b\/school\/(get|student\/get|teacher\/get|parent\/get|people\/get)$/i.test(request.url) && (IGrow.User.schoolid || IGrow.User.schoolid === 0)) {
                            data.schoolid = data.schoolid === undefined ? IGrow.User.schoolid : data.schoolid
                        }
                        if (!/\/api\/1.1b\/(auth\/|school\/get|school\/semester\/)/i.test(request.url) && (IGrow.User.semesterid || IGrow.User.semesterid === 0)) {
                            data.semesterid = data.semesterid === undefined ? IGrow.User.semesterid : data.semesterid
                        }
                        if (data._pagesize || angular.isNumber(data._pagesize)) {
                            data._pagesize = Math.min(Math.max(parseInt(data._pagesize) || 20, 1), 2147483648)
                        }

                        return data
                    };
                    if (request.url && /\/api\/1.1b\//i.test(request.url) && request.method) {
                        if (request.method.toUpperCase() === 'GET') {
                            request.params = $data(request.params || {});
                        } else {
                            request.data = $data(request.data || {});
                            request.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
                            request.transformRequest = [function (data) { return angular.isObject(data) ? $.param(angular.forEach(data = angular.copy(data), function (item, key) { data[key] = (angular.isArray(item) || angular.isObject(item)) ? JSON.stringify(item) : item })) : data }];
                        }
                        request.automask && viewMask.open();
                        request.url = decodeURIComponent(request.url);
                    }
                    return request
                },
                requestError: function (request) { return $q.reject(request) },
                response: function (response) {
                    if (response.config) {
                        response.config.automask && viewMask.close();
                        response.data.message && (response.config.autotips === true || response.config.autotips === 1) && tips.success(response.data.message);
                    }
                    return response
                },
                responseError: function (response) {
                    if (response.config) {
                        response.config.automask && viewMask.close();
                        response.data.message && (response.config.autotips === true || response.config.autotips === 2) && tips.error(response.data.message);
                    }
                    if (response.data && response.data.code == '10020002') { location.href = '/auth/login?go=' + encodeURIComponent(location.href); }
                    return $q.reject(response)
                }
            }
        }]);

        /*  module injector  */
        $provide.factory('moduleInjector', ['$injector', '$log', function ($injector, $log) {
            var injected = {},
                invokeQueue = [],
                runBlocks = [],
                providers = {
                    $animateProvider: $animateProvider,
                    $compileProvider: $compileProvider,
                    $controllerProvider: $controllerProvider,
                    $filterProvider: $filterProvider,
                    $provide: $provide
                };
            return function (modules) {
                angular.forEach(modules, function (item, module) {
                    try {
                        if (!injected[item] && (module = angular.module(item))) {
                            invokeQueue = invokeQueue.concat(module._invokeQueue);
                            runBlocks = runBlocks.concat(module._runBlocks);
                            injected[item] = true;
                        }
                    } catch (ex) {
                        if (ex.message) {
                            ex.message += ' from ' + item;
                            $log.error(ex.message);
                        }
                        throw ex
                    }
                });
                angular.forEach(invokeQueue, function (item, provide) {
                    try {
                        item.length > 2 && providers.hasOwnProperty(item[0]) && (provide = providers[item[0]]) && provide[item[1]].apply(provide, item[2])
                    } catch (ex) {
                        if (ex.message) {
                            ex.message += ' from ' + JSON.stringify(item);
                            $log.error(ex.message);
                        }
                        throw ex
                    }
                });
                angular.forEach(runBlocks, function (item) { $injector.invoke(item) });
                invokeQueue.length = 0;
                runBlocks.length = 0;
            }
        }]);

        /*  route apply  */
        $provide.factory('routeApply', ['$q', '$api', 'lazyLoad', 'moduleInjector', 'viewAuth', 'viewMask', function ($q, $api, lazyLoad, moduleInjector, viewAuth, viewMask) {
            return function (list) {
                angular.forEach(list, function (item) {
                    item.path = item.path instanceof Array ? item.path : [item.path];
                    item.styles = item.styles ? item.styles instanceof Array ? item.styles : [item.styles] : [];
                    item.scripts = item.scripts ? item.scripts instanceof Array ? item.scripts : [item.scripts] : [];
                    item.modules = item.modules ? item.modules instanceof Array ? item.modules : [item.modules] : [];
                    angular.forEach(item.styles, function (path) { this.push(IGrow.Config.extpath(path, 'css')) }, item.styles = []);
                    angular.forEach(item.scripts, function (path) { this.push(IGrow.Config.extpath(path, 'js')) }, item.scripts = []);
                    angular.forEach(item.path, function (path) {
                        this.when('/' + path, {
                            template: item.viewUrl ? undefined : item.view || '<div class="dashboard_welcome"></div>',
                            templateUrl: item.viewUrl ? IGrow.Config.extpath(item.viewUrl, 'html') : undefined,
                            resolve: (item.view || item.viewUrl) && {
                                promise: function () {

                                    viewMask.open();

                                    var defer = $q.defer(),
                                        routeEvent = function (target) {
                                            target = target || 'after';
                                            if (item.route) {
                                                (item.route.global === -1 || item.route.global === undefined) && list.route && (list.route[target] || angular.noop)();
                                                (item.route[target] || angular.noop)();
                                                item.route.global === 1 && list.route && (list.route[target] || angular.noop)();
                                            } else if (list.route) {
                                                (list.route[target] || angular.noop)();
                                            }
                                        };

                                    $q.all([

                                        // get auth
                                        item.auth ? $api._dashboard_authitem.check({ authcodes: item.auth instanceof Array ? item.auth.toString() : item.auth }).$promise : null,

                                        // attach stylesheet
                                        item.styles.length ? lazyLoad.css(item.styles) : null,

                                        // attach script
                                        item.scripts.length ? lazyLoad.js(item.scripts) : null

                                    ]).then(function (result) {

                                        // auth apply
                                        (function (result) {
                                            if (result) {
                                                result = result.data || {};
                                                if (result.auth instanceof Array) {
                                                    angular.forEach(result.auth, function (item) {
                                                        if (item) {
                                                            var prefix = item.substr(0, item.lastIndexOf('.')), atom = item.substr(item.lastIndexOf('.') + 1);
                                                            this[prefix] = this[prefix] || {};
                                                            this[prefix][atom] = true;
                                                        }
                                                    }, result.auth = {});
                                                } else { result.auth = {} }
                                                viewAuth.apply(result.auth);
                                            } else {
                                                viewAuth.apply();
                                            }
                                        }(result[0]));

                                        // module injector
                                        item.modules.length && moduleInjector(item.modules);

                                        // clear array data
                                        item.scripts.length = item.modules.length = 0;

                                        // route event :before
                                        routeEvent('before');

                                        // route compile
                                        setTimeout(function () {
                                            defer.resolve();
                                            viewMask.close();
                                            setTimeout(routeEvent);
                                        });

                                    }, function () {
                                        defer.reject();
                                        viewMask.close();
                                    });

                                    return defer.promise;

                                }
                            }
                        })
                    }, $routeProvider);
                });
                $routeProvider.otherwise({ redirectTo: '/' });
            }
        }]);

        /*  lazyLoad service  */
        $provide.service('lazyLoad', ['$q', function ($q) {
            this.css = function () { return lazyLoad.css.apply($q, arguments) };
            this.js = function () { return lazyLoad.js.apply($q, arguments) };
        }]);

        /*  api service
         *
         * $resource(url, [paramDefaults], [actions], options);
         *
         * config:
         *      $api.apply({
         *          name1 : [url{String}, paramDefaults{Object}|null, actions{Object}|null, options{Object}|null],
         *          name2 : [url{String}, paramDefaults{Object}|null, actions{Object}|null, options{Object}|null],
         *          name3 : [url{String}, paramDefaults{Object}|null, actions{Object}|null, options{Object}|null],
         *      });
         *
         * use:
         *      $api.name1.action([parameters], [success], [error])
         *      $api.name2.action([parameters], postData, [success], [error])
         */
        $provide.service('$api', ['$resource', function ($resource) {

            var fullUrl = function (url, bool) { return (/(^http:\/\/)|(^https:\/\/)|(^\/)/.test(url) ? url : (location.protocol + '//' + location.host + '/api/1.1b/' + url)) + (bool ? '/:dashboard_api_action' : '') };

            this.$apply = function (items, clear) {

                clear && angular.forEach(this, function (item, name) {

                    if (name !== '$apply') {
                        delete this[name]
                    }

                }, this);

                angular.forEach(items, function (item, name) {

                    if (item instanceof Array) {

                        var url = item[0],
                            paramDefaults = item[1],
                            actions = item[2],
                            options = item[3];

                        if (url) {

                            actions = angular.forEach(angular.extend({
                                get: { method: 'GET' },
                                list: { method: 'GET' },
                                search: { method: 'GET' },
                                set: { method: 'POST' },
                                create: { method: 'POST' },
                                update: { method: 'POST' },
                                remove: { method: 'POST' },
                                'delete': { method: 'POST' }
                            }, actions), function (action, name) {
                                action = action || {};
                                if (action.url) { action.url = fullUrl(action.url) }
                                action.method = action.method || 'GET';
                                action.params = angular.extend(action.url ? {} : { dashboard_api_action: name }, action.params);
                            });

                            this[name] = $resource(fullUrl(url, true), paramDefaults, actions, options);

                        }

                    }

                }, this);

                return this;

            }

        }]);

        /*  view auth  */
        $provide.service('viewAuth', function () {
            this.apply = function (data) {
                angular.forEach(this, function (item, name) { !(item instanceof Function) && (delete this[name]) }, this);
                angular.forEach(data, function (item, name) { this[name] = item }, this);
                return this
            }
        });

        /*  view mask  */
        $provide.service('viewMask', function () {
            ~function (self, mask) {
                self.open = self.show = function (callback) {
                    self.loading = self.loading || 0;
                    mask.call(self, callback, true);
                };
                self.close = self.hide = function (callback, closeAll) {
                    if (!(callback instanceof Function)) {
                        callback = null;
                        closeAll = arguments[0];
                    }
                    self.loading = self.loading || 0;
                    mask.call(self, callback, false, closeAll)
                };
            }(this, function (callback, bool, closeAll) {
                if (bool) {
                    this.loading++
                } else {
                    if (closeAll) {
                        this.loading = 0
                    } else {
                        this.loading--
                    }
                }
                setTimeout(callback || angular.noop)
            })
        });

        /*  message tips  */
        $provide.factory('tips', function () {
            return function (action, msg) {
                angular.forEach(action, function (opts, name) {
                    msg[name] = function () {
                        if (angular.isObject(arguments[0])) {
                            opts = angular.extend(opts, arguments[0])
                        }
                        if (angular.isString(arguments[0])) {
                            opts.message = arguments[0]
                        }
                        if (angular.isNumber(arguments[1])) {
                            opts.hideAfter = arguments[1] > 100 ? arguments[1] / 1000 : arguments[1];
                            arguments[1] = null;
                        }
                        return (function (message, callback) {
                            opts.type === 'error' && $(msg._location).children('.messenger-backdrop').show();
                            message.on('hide', function () {
                                callback.apply(this, arguments);
                                message.remove();
                                msg.$el.children('li').length === 0 && $(msg._location).children('.messenger-backdrop').hide();
                            });
                            return message;
                        }(this.post.call(this, opts), arguments[1] || angular.noop))
                    }
                });
                return msg;
            }({
                alert: {
                    type: 'info',
                    showCloseButton: true,
                    hideAfter: 5
                },
                success: {
                    type: 'success',
                    showCloseButton: true,
                    hideAfter: 3
                },
                info: {
                    type: 'info',
                    showCloseButton: true,
                    hideAfter: 5
                },
                warning: {
                    type: 'error',
                    showCloseButton: true,
                    hideAfter: 0
                },
                error: {
                    type: 'error',
                    showCloseButton: true,
                    hideAfter: 0
                }
            }, Messenger({
                extraClasses: 'messenger-fixed messenger-on-top',
                parentLocations: ['body>.messenger-container'],
                theme: 'air'
            }))
        });

    }]);

    /*  app controller  */
    app.controller(app.name + '.controller', ['$rootScope', '$compile', '$location', '$route', '$timeout', '$q', '$api', 'routeApply', 'moduleInjector', 'viewMask', 'tips', function ($rootScope, $compile, $location, $route, $timeout, $q, $api, routeApply, moduleInjector, viewMask, tips) {

        //init config
        $api.$apply(angular.extend({
            _dashboard_school: ['school'],
            _dashboard_semester: ['school/semester'],
            _dashboard_member: ['school/group/member'],
            _dashboard_app: ['auth/user/app'],
            _dashboard_element: ['auth/user/app/element'],
            _dashboard_role: ['auth/user/role', , { check: {} }],
            _dashboard_authitem: ['auth/merged/user/authitem', , { check: {} }],
            _dashboard_user: ['user']
        }, IGrow.Config.service));

        moduleInjector(IGrow.Config.preload.modules);

        routeApply(IGrow.Config.menu);
        !$route.routes['/'] && routeApply([{ path: '' }]);

        //toolbar
        ~function ($data, host) {
            if (host !== 'schoolapp.igrow.cn') { $data.app.enable = true }
            $data.app.logout = 'http://auth.igrow.cn/auth/logout' + (host === 'schoolapp.igrow.cn' ? '?go=http://schoolapp.igrow.cn/auth/login' : '');
        }(this.data = IGrow.Data, location.host);

        //modifies attributes of viewMask.loading
        ~function (self, value) {
            Object.defineProperty(viewMask, 'loading', {
                set: function (x) { self.loading = (value = x) ? (self.data.menu.length ? 'element' : 'base') : false ;},
                get: function () { return value },
                enumerable: true,
                configurable: true
            })
        }(this);

        //init base data
        ~function _init($data, $hash) {
            $q.all([

                /*  get user data  */
                !$data.user && $api._dashboard_user.get({ _relatedfields: 'school.teacher.*' }, function (result) { IGrow.User = $data.user = result.data || {} }).$promise,

                /*  get role  */
                $api._dashboard_role.check({ rolecodes: 'schoolgroup.*,school.admin,school.master,school.vice_master,school.class.master,school.class.teacher' }, function (result) {
                    result.data && angular.forEach(result.data.roles, function (role) {
                        if (/^schoolgroup\.[a-z_.]+$/i.test(role)) {
                            IGrow.Role.group = true
                        }
                        if (/school\.admin|school\.master|school\.vice_master/i.test(role)) {
                            IGrow.Role.master = true
                        }
                        if (/school\.class\.master|school\.class\.teacher/i.test(role)) {
                            IGrow.Role.teacher = true
                        }
                    })
                }).$promise,

                /*  get app data  */
                $api._dashboard_app.list({ _relatedfields: 'modules.id,modules.code,modules.name' }, function (result) {
                    angular.forEach(result.data || [], function (item) {
                        if (item.code === IGrow.Config.app.code) {
                            document.title = item.name;
                            $data.app.current = item;
                        }
                        this.push(item);
                    }, $data.app)
                }).$promise,

                /*  get semester data  */
                IGrow.Config.app.code === 'YO' && $api._dashboard_semester.list({ _orderby: 'starttime desc' }).$promise

            ]).then(function (result) {
                result[3] && ~function (list, before, after) {
                        delete this.current;
                        angular.forEach(list, function (item) {
                            this.push(item);
                            if (!this.current) {
                                if (item.status === 1) {
                                    this.current = item
                                }
                                if (item.status === 2 && !before) {
                                    before = item
                                }
                                if (item.status === 0) {
                                    after = item
                                }
                            }
                        }, this);
                        if (!this.current && (before || after)) {
                            this.current = before || after
                        }
                        if (this.current) {
                            IGrow.User.semesterid = this.current.id
                        }
                    }.call($data.semester, result[3].data || []);

                /*  check user role and set school  */
                if ($data.app.current && ($data.app.current.modules || []).length) {

                    //fill empty route
                    ~function (menu) {
                        angular.forEach($data.app.current.modules, function (item) {
                            $data.menu.push(item);
                            !$route.routes['/' + item.code] && menu.push({ path: item.code });
                        });
                        menu.length && routeApply(menu);
                    }([]);

                    /*  get school data  */
                    (IGrow.Role.group ? $api._dashboard_member.list : $api._dashboard_school.get)(function (result) {

                        if (IGrow.Role.group) {
                            angular.forEach(result.data || [], function (item) {
                                $data.school.push(item);
                                if (item.id === IGrow.User.schoolid) {
                                    $data.school.current = item
                                }
                            })
                        } else {
                            $data.school.current = result.data || {}
                        }

                        IGrow.User.school = angular.extend(IGrow.User.school || {}, $data.school.current);

                        if (angular.isString($hash)) {

                            if (location.host !== 'babyapp.igrow.cn') {
                                $data.app.control = IGrow.User.school.typeid === 1 ? 'http://baby.igrow.cn' : 'http://school.igrow.cn'
                            }

                            //get,set IGrow.Log and localStorage
                            ~function (Log, User) {

                                User = Log[IGrow.User.uid] = Log[IGrow.User.uid] || {};

                                //modifies attributes of IGrow.Log.menu
                                angular.forEach(IGrow.Log.menu, function (val, key) {
                                    Object.defineProperty(this, key, {
                                        set: function (x) {
                                            val = x;
                                            $timeout(function () {
                                                User.menu = [
                                                    IGrow.Log.menu.module,
                                                    IGrow.Log.menu.module ? IGrow.Log.menu.element : ''
                                                ].join('|##|');
                                                localStorage['igr_dashboard_' + IGrow.Config.app.code] = JSON.stringify(Log);
                                            })
                                        },
                                        get: function () { return val },
                                        enumerable: true,
                                        configurable: true
                                    })
                                }, IGrow.Log.menu);

                                if ($hash) {
                                    //get requst,hash
                                    if (/^act\//i.test($hash) && ($hash = $hash.replace('act/', '').split('/')).length) {
                                        IGrow.Log.menu.module = $hash[0] || '';
                                        IGrow.Log.menu.element = $hash[1] || '';
                                    } else {
                                        IGrow.Log.menu.element = $hash
                                    }
                                } else {
                                    //get localStorage
                                    angular.forEach((User.menu || '').split('|##|'), function (val, idx) {
                                        if (idx === 0) {
                                            IGrow.Log.menu.module = val
                                        }
                                        if (idx === 1) {
                                            IGrow.Log.menu.element = val
                                        }
                                    })
                                }

                            }(JSON.parse(localStorage['igr_dashboard_' + IGrow.Config.app.code] || '{}'));

                            $data.school.click = function (item) {
                                //clear
                                $data.app.length = 0;
                                $data.school.length = 0;
                                $data.semester.length = 0;
                                $data.menu.length = 0;
                                //set school
                                $data.school.current = item;
                                IGrow.User.schoolid = item.id;
                                $location.url('/').replace();
                                _init($data);
                            };
                            $data.semester.click = function (item) {
                                IGrow.User.semesterid = item.id;
                                $data.semester.current = item;

                                $route.reload();
                            };
                            $data.menu.click = function (event, item, level) {
                                switch (level) {
                                    case 0:
                                        if (item.code === $data.menu.module.code) {
                                            $timeout(function () {
                                                if (item.open) {
                                                    delete item.open;
                                                    sidebar.collapse();
                                                } else {
                                                    item.open = true;
                                                    sidebar.expand();
                                                }
                                            })
                                        }
                                        break;
                                    case 1:
                                        item.active && $route.reload();
                                        break;
                                }
                            };
                            $data.school.move = function(item,isMove){
                                if(isMove && item.name.length > 8){
                                    item.style = {'text-indent': - (item.name.length -8)*18 +'px'};
                                }else{
                                    item.style = {'text-indent':0};
                                }
                            };

                        }

                        $location.url('/' + (IGrow.Log.menu.element || IGrow.Log.menu.module || IGrow.Log.menu.preset || $data.menu[0].code)).replace();

                    });

                } else {
                    tips.error({
                        message: '您没有该系统操作权限！',
                        actions: {
                            cancel: {
                                label: '退出系统 <i class="fa fa-sign-out"></i>',
                                action: function () { this.cancel() }
                            }
                        }
                    }, function () { location.href = '/auth/logout' });
                }

            })
        }(this.data, $location.url().replace(/^\//, ''));

        //route change event
        ~function ($data, stylesheet, modalbackdrop) {
            //set root
            $location.url('/');
            $compile(ngView.html('<div ng-view></div>'))($rootScope);
            //#1
            $rootScope.$on('$routeChangeStart', function (event, next, current) {

                stylesheet = $('head>[class="lazyLoad-stylesheet"]');
                modalbackdrop = $('body>.modal-backdrop');

                next && next.originalPath && $data.user && ~function hashvalid(originalPath) {

                    if (originalPath && (!$data.menu.module || !routevalid($data.menu.module.code, originalPath))) {
                        sidebar.collapse();
                        $timeout(sidebar.expand);
                    }

                    delete $data.menu.module;
                    delete $data.menu.element;
                    IGrow.Log.menu.module = '';
                    IGrow.Log.menu.element = '';

                    angular.forEach($data.menu, function (item) {
                        delete item.active;
                        delete item.open;
                        if (originalPath && routevalid(item.code, originalPath)) {
                            item.active = true;
                            item.open = true;
                            IGrow.Log.menu.module = item.code;
                            $data.menu.module = item;
                            angular.forEach(item.children, function (item) {
                                delete item.active;
                                if (routevalid(item.code, originalPath)) {
                                    item.active = true;
                                    $data.menu.element = item;
                                    IGrow.Log.menu.element = $location.url().replace(/^\//, '');
                                }
                            });
                            if (!item.children) {
                                item.loading = [$api._dashboard_element.list({
                                    automask: false,
                                    modulecode: item.code,
                                    _orderby: 'displayorder desc'
                                }, function (result) {

                                    delete item.loading;
                                    delete $data.menu.loading;
                                    item.children = [];

                                    angular.forEach(result.data, function (children) {
                                        if (!children.haschild && children.type === 1) {
                                            item.children.push(children);
                                            $route.routes['/' + children.code] = $route.routes['/' + children.code] || {
                                                originalPath: '/' + children.code,
                                                redirectTo: '/' + item.code,
                                                regexp: new RegExp('^\\/' + children.code.replace(/\./g, '\\.') + '$')
                                            };
                                            $route.routes['/' + children.code + '/'] = $route.routes['/' + children.code + '/'] || {
                                                originalPath: '/' + children.code + '/',
                                                redirectTo: '/' + item.code,
                                                regexp: new RegExp('^\\/' + children.code.replace(/\./g, '\\.') + '\\/$')
                                            };
                                        }
                                    });

                                    hashvalid(originalPath);
                                    $timeout(sidebar.expand);

                                })];
                                if (originalPath !== item.code) {
                                    $data.menu.loading = item.loading
                                }
                            }
                        }
                    });

                    if (originalPath) {
                        if ($data.menu.loading) {
                            event.preventDefault();
                        } else if (!$data.menu.module || (!$data.menu.element && originalPath !== $data.menu.module.code)) {
                            event.preventDefault();
                            $location.url('/' + ($data.menu.module ? $data.menu.module.code : '')).replace();
                        }
                    } else {
                        sidebar.collapse()
                    }

                }(next.originalPath.replace(/^\//, ''));

            });
            //#2
            //$rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl, newState, oldState) { });
            //#3
            //$rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl, newState, oldState) { });
            //#4
            $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
                stylesheet && stylesheet.remove();
                modalbackdrop && modalbackdrop.remove();
            });
            //#5
            //$rootScope.$on('$routeChangeError', function (event, current, previous, rejection) { });
        }(this.data);

    }]);

    /*  get config  */
    lazyLoad.js('/assets/js' + ((/(.*)\/dashboard/i.exec(location.pathname) || [])[1] || '') + '/dashboard/config.js', function () {

        /*  extend config  */
        IGrow.Config = angular.extend({
            timestamp: Date.parse(new Date()) / 1000,
            automask: false,
            autotips: false, /*[true:all,1:success,2:error]*/
            app: { code: '', dir: 'dashboard/' },
            menu: [{ auth: '', path: '', view: '<div class="dashboard_welcome"></div>', viewUrl: null, styles: null, scripts: null, modules: null }],
            preload: [/*{ styles: null, scripts: null, modules: null }*/],
            service: {/* $resource actions */ },
            extpath: function (path, ext) {
                var filedir = '/assets/' + (ext === 'html' ? 'views' : ext) + '/' + this.app.dir + (ext === 'js' ? 'controllers/' : ''),
                    fileext = '.' + ext,
                    nofirst = !/(^http:\/\/)|(^https:\/\/)|(^\/)/.test(path),
                    noparam = !new RegExp('\\.' + ext + '\\?', 'i').test(path),
                    nullext = !new RegExp('(\\.' + ext + '$)|(\\.' + ext + '\\?)', 'i').test(path);
                if (nofirst) path = filedir + path;
                if (nullext) path = path + fileext;
                if (nofirst && noparam) path = path + '?_' + this.timestamp;
                return path;
            }
        }, IGrow.Config);

        /*  preload extend  */
        angular.forEach(IGrow.Config.preload, function (item) {
            if (angular.isString(item)) {
                item && this[/\.css$|\.css\?/.test(item) ? 'styles' : 'scripts'].push(item)
            } else if (angular.isObject(item)) {
                angular.forEach(['styles', 'scripts', 'modules'], function (key) {
                    if (item[key] instanceof Array) {
                        angular.forEach(item[key], function (val) { this.push(val) }, this[key])
                    } else if (item[key]) {
                        this[key].push(item[key])
                    }
                }, this)
            }
        }, IGrow.Config.preload = { styles: [], scripts: [], modules: [] });

        /*  angular.bootstrap  */
        $.when(lazyLoad.css(IGrow.Config.preload.styles, true), lazyLoad.js(IGrow.Config.preload.scripts)).done(function () {
            /*  bind root controller  */
            $(document.body).attr('ng-controller', app.name + '.controller as self').children('script').remove();
            /*  angular rendering  */
            angular.bootstrap(document, [app.name]);
        });

    });

});
