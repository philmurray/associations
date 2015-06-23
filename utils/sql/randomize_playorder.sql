UPDATE words w
SET play_order=floor(rank/2000)*2000+random()*2000 + COALESCE(foobar,200)
from (
    select text, (select 1 from graph_rels g where g.from = text limit 1) as foobar
    from words
) g
where w.text = g.text;
