(function() {
    'use strict';

    function AnimeComponent() {
        var network = new Lampa.Request();
        var scroll;
        var html = $('<div class="category-full"></div>');

        this.create = function() {
            scroll = new Lampa.Scroll({mask:true, over:true});
            scroll.append(html);
            Lampa.Loading.start(); // показываем сразу
            this.load();
            return scroll.render();
        };

        this.load = function() {
            var _this = this;

            network.api('discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc', function(json){
                Lampa.Loading.stop();
                if(!json || !json.results || !json.results.length){
                    html.html('<div style="color:#fff; text-align:center; margin-top:50px;">Список пуст</div>');
                    return;
                }
                _this.build(json.results);
            }, function(){
                Lampa.Loading.stop();
                html.html('<div style="color:#fff; text-align:center; margin-top:50px;">Ошибка сети</div>');
            });
        };

        this.build = function(results){
            html.empty();
            results.forEach(function(item){
                if(!item.poster_path) return;

                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                card.on('click', function(){
                    Lampa.Search.open({query:item.name || item.original_name});
                });

                html.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.render = function(){ return scroll ? scroll.render() : ''; };
        this.destroy = function(){ network.clear(); if(scroll) scroll.destroy(); html.remove(); };
    }

    Lampa.Component.add('anime_mod_final', AnimeComponent);

    function injectMenu(){
        if($('.menu [data-action="anime_mod_final"]').length) return;
        if(!$('.menu .menu__list').length) return;

        var menu_item = $(`
            <div class="menu__item selector" data-action="anime_mod_final">
                <div class="menu__ico">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                </div>
                <div class="menu__text">Аниме Онлайн</div>
            </div>
        `);

        menu_item.on('click', function(){
            Lampa.Activity.push({title:'Аниме Онлайн', component:'anime_mod_final'});
        });

        if($('.menu [data-action="tv"]').length){
            $('.menu [data-action="tv"]').after(menu_item);
        } else {
            $('.menu .menu__list').append(menu_item);
        }
    }

    Lampa.Listener.follow('menu', function(e){
        if(e.type==='ready') injectMenu();
    });

})();
