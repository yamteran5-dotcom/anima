(function(){
    'use strict';

    function AnimeComponent(){
        var network = new Lampa.Request();
        var scroll = new Lampa.Scroll({mask:true, over:true});
        var html = $('<div class="category-full"></div>');
        scroll.append(html);

        this.create = function(){
            Lampa.Loading.start();
            this.load();
            return scroll.render();
        };

        this.load = function(){
            var _this = this;
            network.api('discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc',
                function(json){
                    Lampa.Loading.stop();
                    if(!json || !json.results || !json.results.length){
                        html.html('<div style="text-align:center; margin-top:50px; color:#fff;">Список пуст</div>');
                        return;
                    }
                    _this.build(json.results);
                },
                function(){
                    Lampa.Loading.stop();
                    html.html('<div style="text-align:center; margin-top:50px; color:#fff;">Ошибка сети или блокировка TMDB</div>');
                }
            );
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

        this.render = function(){ return scroll.render(); };
        this.destroy = function(){ network.clear(); scroll.destroy(); html.remove(); };
    }

    Lampa.Component.add('anime_final_v50', AnimeComponent);

    function injectMenu(){
        if($('.menu [data-action="anime_final_v50"]').length) return;
        var menuList = $('.menu .menu__list');
        if(!menuList.length) return;

        var menuItem = $(`
            <div class="menu__item selector" data-action="anime_final_v50">
                <div class="menu__ico">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                </div>
                <div class="menu__text">Аниме</div>
            </div>
        `);

        menuItem.on('click', function(){
            Lampa.Activity.push({title:'Аниме Онлайн', component:'anime_final_v50'});
        });

        var tv = menuList.find('[data-action="tv"]');
        if(tv.length) tv.after(menuItem); else menuList.append(menuItem);
    }

    Lampa.Listener.follow('menu', function(e){
        if(e.type==='ready') injectMenu();
    });

})();
