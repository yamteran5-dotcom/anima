(function () {
    'use strict';

    function AnimeKodikPlugin() {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var active_tab = 0;

        // Публичный токен Kodik
        var token = 'd6ee39461103e3002f5b5b93931903ee'; 

        var tabs = [
            {title: 'Популярное', params: '&types=anime-serial,anime&order=shikimori_rating'},
            {title: 'Онгоинги', params: '&types=anime-serial&status=ongoing'},
            {title: 'Новинки', params: '&types=anime-serial,anime&order=year'},
            {title: '18+ (Hentai)', params: '&types=hentai,hentai-serial'}
        ];

        this.create = function () {
            var _this = this;
            
            // Создание вкладок
            var bar  = $('<div class="layer--tabs"><div class="layer--tabs_list"></div></div>');
            tabs.forEach(function (tab, i) {
                var t = $('<div class="layer--tabs_item selector">' + tab.title + '</div>');
                if (i === active_tab) t.addClass('active');
                t.on('hover:enter', function () {
                    if (active_tab === i) return;
                    active_tab = i;
                    bar.find('.layer--tabs_item').removeClass('active');
                    $(this).addClass('active');
                    _this.load();
                });
                bar.find('.layer--tabs_list').append(t);
            });

            html.append(bar).append(scroll.render());
            scroll.append(body);
            
            this.load();
            return this.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            body.empty();
            scroll.reset();

            // Формируем URL через прокси Lampa
            var url = Lampa.Utils.proxy('https://kodikapi.com/list?token=' + token + tabs[active_tab].params + '&limit=50&with_material_data=true');

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    body.append('<div class="empty" style="padding: 40px; text-align: center;">Ничего не найдено в базе Kodik</div>');
                }
            }, function () {
                Lampa.Loading.stop();
                body.append('<div class="empty" style="padding: 40px; text-align: center;">Ошибка сети (Kodik). Попробуйте сменить прокси в настройках.</div>');
            });
        };

        this.build = function(items) {
            items.forEach(function (item) {
                // Пытаемся взять постер из данных материала, если нет - скриншот
                var img = '';
                if (item.material_data && item.material_data.poster_url) {
                    img = item.material_data.poster_url;
                } else if (item.screenshots && item.screenshots[0]) {
                    img = item.screenshots[0];
                }
                
                if (img && img.indexOf('http') === -1) img = 'https:' + img;

                var card = new Lampa.Card({
                    id: item.id,
                    title: item.russian_title || item.title,
                    img: img,
                    year: item.year || (item.material_data ? item.material_data.year : '')
                }, {
                    card_source: 'kodik'
                });

                card.on('enter', function () {
                    Lampa.Activity.push({
                        component: 'full',
                        id: item.id,
                        method: 'anime',
                        card: card.object,
                        source: 'kodik'
                    });
                });

                card.create();
                body.append(card.render());
            });
            
            Lampa.Controller.enable('content');
        };

        this.render  = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function start() {
        Lampa.Component.add('anime_kodik', AnimeKodikPlugin);
        
        var item = $('<div class="menu__item selector" data-action="anime_kodik">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg></div>' +
            '<div class="menu__text">Аниме (Kodik)</div>' +
        '</div>');

        item.on('hover:enter', function () {
            Lampa.Activity.push({
                title: 'Аниме (Kodik)',
                component: 'anime_kodik'
            });
        });

        $('.menu .menu__list').append(item);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });
})();
