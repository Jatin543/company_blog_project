from django.conf.urls import url
from blog import views

urlpatterns=[
    url(r'^main/$' , views.PostListView.as_view(), name='post_list'),
    url(r'^about/$' , views.AboutaboutView.as_view(),name="aboutabout"),
    url(r'^blogs/$' , views.BlogsView.as_view(),name="blogsview"),
    url(r'^blogs/the_perfect_resume/$' , views.the_perfect_resume.as_view(),name="the_perfect_resume"),
    url(r'^blogs/about_data_science/$' , views.about_data_science.as_view(),name="about_data_science"),
    url(r'^blogs/how_to_wfh/$' , views.how_to_wfh.as_view(),name="how_to_wfh"),
    url(r'^$' ,views.AboutView.as_view(),name="about"),
    url(r'^post/(?P<pk>\d+)/$',views.PostDetailView.as_view(),name="post_detail"),
    url(r'^post/new/$', views.CreatePostView.as_view(),name='post_new'),
    url(r'^post/(?P<pk>\d+)/edit/$', views.PostUpdateView.as_view(),name='post_edit'),
    url(r'^post/(?P<pk>\d+)/remove/$', views.PostDeleteView.as_view(), name='post_remove'),
    url(r'^draft/$', views.DraftListView.as_view(),name='post_draft_list'),
    url(r'^post/(?P<pk>\d+)/comment/$',views.add_comment_to_post,name='add_comment_to_post'),
    url(r'^comment/(?P<pk>\d+)/$',views.comment_approve,name='comment_approve'),
    url(r'^comment/(?P<pk>\d+)/remove/$',views.comment_remove,name='comment_remove'),
    url(r'^post/(?P<pk>\d+)/publish/$',views.post_publish,name='post_publish'),


]
