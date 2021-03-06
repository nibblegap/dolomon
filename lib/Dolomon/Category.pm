package Dolomon::Category;
use Mojo::Base 'Dolomon::Db';
use Dolomon::Dolo;

has 'table' => 'categories';
has 'name';
has 'user_id';
has 'dolos' => sub {
    return Mojo::Collection->new();
};

=head1 Dolomon::Category

=head2 new

Get a L<Dolomon::Category>.

If the id is provided, fetch the informations from the database and fill the C<dolos> attribute
with a L<Mojo::Collection> of L<Dolomon::Dolo> belonging to the category.

=cut
sub new {
    my $c = shift;

    $c = $c->SUPER::new(@_);

    my @dolos = ();
    if (defined $c->id) {
        my $r = $c->app->pg->db->query('SELECT id, url, short, name, extra, count, initial_count, category_id, parent_id, created_at FROM dolos WHERE category_id = ? AND parent_id IS NULL ORDER BY id', $c->id);
        while (my $next = $r->hash) {
            my $dolo = Dolomon::Dolo->new(app => $c->app)
                ->category_id($c->id)
                ->category_name($c->name)
                ->id($next->{id})
                ->url($next->{url})
                ->short($next->{short})
                ->name($next->{name})
                ->extra($next->{extra})
                ->count($next->{count})
                ->created_at($next->{created_at});
            my @achild = ();
            my $children = $c->app->pg->db->query('SELECT id, url, short, name, extra, count, initial_count, category_id, parent_id, created_at FROM dolos WHERE parent_id = ? ORDER BY id', $next->{id})->hashes;
            $children->each(sub {
                my ($e, $num) = @_;
                my $child = Dolomon::Dolo->new(app => $c->app)
                    ->category_id($c->id)
                    ->category_name($c->name)
                    ->id($e->{id})
                    ->url($e->{url})
                    ->short($e->{short})
                    ->name($e->{name})
                    ->extra($e->{extra})
                    ->parent_id($e->{parent_id})
                    ->count($e->{count})
                    ->created_at($e->{created_at});

                my $tags = $c->app->pg->db->query('SELECT t.id, t.name FROM dolo_has_tags d JOIN tags t ON t.id = d.tag_id WHERE d.dolo_id = ? ORDER BY t.name', $e->{id})->hashes;
                my @atags;
                $tags->each(sub {
                    my ($t, $num) = @_;
                    push @atags, $t;
                });
                $child->tags(\@atags);
                push @achild, $child;
            });
            $dolo->children(Mojo::Collection->new(@achild));

            my @atags;
            my $tags = $c->app->pg->db->query('SELECT t.id, t.name FROM dolo_has_tags d JOIN tags t ON t.id = d.tag_id WHERE d.dolo_id = ? ORDER BY t.name', $next->{id})->hashes;
            $tags->each(sub {
                my ($e, $num) = @_;
                push @atags, $e;
            });
            $dolo->tags(\@atags);
            push @dolos, $dolo;
        }
    }

    $c->dolos(Mojo::Collection->new(@dolos));

    return $c;
}

=head2 evacuate_to

Changes the C<category_id> of all the L<Dolomon::Dolo> belonging to the current category.

=cut
sub evacuate_to {
    my $c          = shift;
    my $new_cat_id = shift;
    $c->app->pg->db->query('UPDATE dolos SET category_id = ? WHERE category_id = ?', ($new_cat_id, $c->id));
}

=head2 count

Returns the number of L<Dolomon::Dolo> belonging to the current category.

=cut
sub count {
    my $c = shift;

    return $c->app->pg->db->query('SELECT SUM(count) FROM dolos WHERE category_id = ?', $c->id)->array->[0];
}

=head2 get_raw_dys

Returns a L<Mojo::Collection> of hash tables representing the yearly stats of the dolos belonging to the current category.

=cut
sub get_raw_dys {
    my $c = shift;

    return $c->app->pg->db->query('SELECT y.year, SUM(y.count) AS count FROM dolos_year y JOIN dolos d ON y.dolo_id = d.id WHERE d.category_id = ? GROUP BY y.year ORDER BY y.year ASC', $c->id)->hashes;
}

=head2 get_raw_dms

Returns a L<Mojo::Collection> of hash tables representing the monthly stats of the dolos belonging to the current category.

=cut
sub get_raw_dms {
    my $c = shift;

    return $c->app->pg->db->query('SELECT m.year, m.month, SUM(m.count) AS count FROM dolos_month m JOIN dolos d ON m.dolo_id = d.id WHERE d.category_id = ? GROUP BY m.year, m.month ORDER BY m.year, m.month ASC', $c->id)->hashes;
}

=head2 get_raw_dws

Returns a L<Mojo::Collection> of hash tables representing the weekly stats of the dolos belonging to the current category.

=cut
sub get_raw_dws {
    my $c = shift;

    return $c->app->pg->db->query('SELECT w.year, w.week, SUM(w.count) AS count FROM dolos_week w JOIN dolos d ON w.dolo_id = d.id WHERE d.category_id = ? GROUP BY w.year, w.week ORDER BY w.year, w.week ASC', $c->id)->hashes;
}

=head2 get_raw_dds

Returns a L<Mojo::Collection> of hash tables representing the dayly stats of the dolos belonging to the current category.

=cut
sub get_raw_dds {
    my $c = shift;

    return $c->app->pg->db->query('SELECT a.year, a.month, a.day, SUM(a.count) AS count FROM dolos_day a JOIN dolos d ON a.dolo_id = d.id WHERE d.category_id = ? GROUP BY a.year, a.month, a.day ORDER BY a.year, a.month, a.day ASC', $c->id)->hashes;
}

=head2 get_raw_dhs

Returns a L<Mojo::Collection> of hash tables representing the hits??? stats of the dolos belonging to the current category.

=cut
sub get_raw_dhs {
    my $c = shift;

    return $c->app->pg->db->query('SELECT h.* FROM dolos_hits h JOIN dolos d ON h.dolo_id = d.id WHERE d.category_id = ? ORDER BY ts ASC', $c->id)->hashes;
}

1;
