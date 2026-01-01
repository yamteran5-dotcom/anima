(function () {
    'use strict';

    function AnimePro(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask:true, over:true});
        var items   = [];
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var active  = 0;
        var page    = 1;

        var tabs = [
            { title: 'Топ аниме', params: 'order=ranked&limit=40' },
            { title: 'Онгоинги', params: 'status=ongoing&order=popularity&limit=40' },
            { title: 'Сейчас смотрят', params: 'season=2024_2025&order=popularity&limit=40' },
            { title: 'Все аниме', params: 'order=popularity&limit=40' },
            { title: '18+', params: 'rating=rx,r_plus&censored=false&order=popularity&limit=40' }
        ];

        this.create = function () {
            var _this = this;

            // Создаем табы
            var bar   = $('<div class="layer--tabs"></div>');
            var list  = $('<div class="layer--tabs_list"></div>');

            tabs.forEach(function (tab, i) {
                var item = $('<div class="layer--tabs_item selector '+(active == i ? 'active' : '')+'" data-index="'+i+'">'+tab.title+'</div>');
                item.on('hover:enter', function () {
                    if (active == i) return;
                    active = i;
                    page = 1;
                    $('.layer--tabs_item', list).removeClass('active');
                    $(this).addClass('active');
                    _this.load();
                });
                list.append(item);
            });

            html.append(bar);
            html.append(scroll.render());
            scroll.append(body);

            this.load();

            return this.render();
        };

        this.load = function (append) {
            var _this = this;
            if(!append) {
                body.empty();
                scroll.reset();
                Lampa.Loading.start();
            }

            var query = tabs[active].params + '&page=' + page + '&censored=false'; 
            var url = Lampa.Utils.proxy('https://shikimori.one/api/animes?' + query);

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if(json && json.length){
                    _this.build(json);
                } else if(!append) {
                    body.append('<div class="empty">Ничего не найдено</div>');
                }
            }, function(){
                Lampa.Loading.stop();
                if(!append) body.append('<div class="empty">Ошибка загрузки</div>');
            });
        };

        this.build = function (data) {
            var _this = this;
            data.forEach(function(item){
                var img = item.image ? (item.image.original.indexOf('http') == -1 ? 'https://shikimori.one' + item.image.original : item.image.original) : '';
                
                var card = new Lampa.Card({
                    id: item.id,
                    title: item.russian || item.name,
                    img: img,
                    year: item.aired_on ? item.aired_on.split('-')[0] : '????'
                }, {
                    card_source: 'shikimori'
                });

                card.on('enter', function(){
                    Lampa.Activity.push({
                        url: '',
                        component: 'full',
                        id: item.id,
                        method: 'anime',
                        card: card.object,
                        source: 'shikimori'
                    });
                });

                card.create();
                body.append(card.render());
            });

            Lampa.Controller.enable('content');
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            scroll.destroy();
            html.remove();
        };
    }

    function startPlugin() {
        window.plugin_anime_pro_ready = true;
        Lampa.Component.add('anime_pro', AnimePro);
        
        var menu_item = $('<div class="menu__item selector" data-action="anime_pro">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Pro</div>' +
        '</div>');

        menu_item.on('hover:enter', function () {
            Lampa.Activity.push({
                title: 'Аниме Pro',
                component: 'anime_pro',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') startPlugin();
    });
})();(function () {
    'use strict';

    function AnimePro(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask:true, over:true});
        var items   = [];
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var active  = 0;
        var page    = 1;

        var tabs = [
            { title: 'Топ аниме', params: 'order=ranked&limit=40' },
            { title: 'Онгоинги', params: 'status=ongoing&order=popularity&limit=40' },
            { title: 'Сейчас смотрят', params: 'season=2024_2025&order=popularity&limit=40' },
            { title: 'Все аниме', params: 'order=popularity&limit=40' },
            { title: '18+', params: 'rating=rx,r_plus&censored=false&order=popularity&limit=40' }
        ];

        this.create = function () {
            var _this = this;

            // Создаем табы
            var bar   = $('<div class="layer--tabs"></div>');
            var list  = $('<div class="layer--tabs_list"></div>');

            tabs.forEach(function (tab, i) {
                var item = $('<div class="layer--tabs_item selector '+(active == i ? 'active' : '')+'" data-index="'+i+'">'+tab.title+'</div>');
                item.on('hover:enter', function () {
                    if (active == i) return;
                    active = i;
                    page = 1;
                    $('.layer--tabs_item', list).removeClass('active');
                    $(this).addClass('active');
                    _this.load();
                });
                list.append(item);
            });

            html.append(bar);
            html.append(scroll.render());
            scroll.append(body);

            this.load();

            return this.render();
        };

        this.load = function (append) {
            var _this = this;
            if(!append) {
                body.empty();
                scroll.reset();
                Lampa.Loading.start();
            }

            var query = tabs[active].params + '&page=' + page + '&censored=false'; 
            var url = Lampa.Utils.proxy('https://shikimori.one/api/animes?' + query);

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if(json && json.length){
                    _this.build(json);
                } else if(!append) {
                    body.append('<div class="empty">Ничего не найдено</div>');
                }
            }, function(){
                Lampa.Loading.stop();
                if(!append) body.append('<div class="empty">Ошибка загрузки</div>');
            });
        };

        this.build = function (data) {
            var _this = this;
            data.forEach(function(item){
                var img = item.image ? (item.image.original.indexOf('http') == -1 ? 'https://shikimori.one' + item.image.original : item.image.original) : '';
                
                var card = new Lampa.Card({
                    id: item.id,
                    title: item.russian || item.name,
                    img: img,
                    year: item.aired_on ? item.aired_on.split('-')[0] : '????'
                }, {
                    card_source: 'shikimori'
                });

                card.on('enter', function(){
                    Lampa.Activity.push({
                        url: '',
                        component: 'full',
                        id: item.id,
                        method: 'anime',
                        card: card.object,
                        source: 'shikimori'
                    });
                });

                card.create();
                body.append(card.render());
            });

            Lampa.Controller.enable('content');
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            scroll.destroy();
            html.remove();
        };
    }

    function startPlugin() {
        window.plugin_anime_pro_ready = true;
        Lampa.Component.add('anime_pro', AnimePro);
        
        var menu_item = $('<div class="menu__item selector" data-action="anime_pro">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Pro</div>' +
        '</div>');

        menu_item.on('hover:enter', function () {
            Lampa.Activity.push({
                title: 'Аниме Pro',
                component: 'anime_pro',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') startPlugin();
    });
})();
