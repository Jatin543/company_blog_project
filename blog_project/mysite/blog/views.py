from django.shortcuts import render,get_object_or_404,redirect
from django.views.generic import (TemplateView,CreateView,ListView,DeleteView,DetailView,UpdateView)
from blog.forms import (CommentForm,PostForm)
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from blog.models import Comment,Post

# Create your views here.

class AboutView(TemplateView):
    template_name="index.html"

class AboutaboutView(TemplateView):
    template_name="about_2.html"

class BlogsView(TemplateView):
    template_name="blog.html"

class the_perfect_resume(TemplateView):
    template_name="blog/the_perfect_resume.html"

class about_data_science(TemplateView):
    template_name="blog/about_data_science.html"

class how_to_wfh(TemplateView):
    template_name="blog/work_from_home.html"

class PostListView(ListView):
    model=Post

    def get_queryset(self):
        return Post.objects.filter(published_date__lte=timezone.now()).order_by('-published_date')


class PostDetailView(DetailView):
    model=Post

class CreatePostView(LoginRequiredMixin,CreateView):
    login_url='/login/'
    redirect_field_name='blog/post_detail.html'
    form_class = PostForm
    model=Post




class PostUpdateView(LoginRequiredMixin,UpdateView):
    login_url='/login/'
    redirect_field_name='blog/post_detail.html'

    form_class = PostForm

    model=Post

class PostDeleteView(LoginRequiredMixin,DeleteView):
    model=Post
    success_url=reverse_lazy('post_list')

class DraftListView(LoginRequiredMixin,ListView):
    login_url='/login/'
    redirect_field_name='blog/post_list.html'

    def get_queryset(self):
        return Post.objects.filter(published_date__isnull=True).order_by('-create_date')




def add_comment_to_post(request,pk):

    post=get_object_or_404(Post,pk=pk)

    if request.method=='POST':
        form=CommentForm(request.POST)
        if form.is_valid():
            comment=form.save(commit=False)
            comment.post=post
            comment.save()
            return redirect('post_detail',pk=post.pk)
    else:
        form=CommentForm()
    return render(request,'blog/comment_form.html',{'form':form})

@login_required
def comment_approve(request,pk):
    comment=get_object_or_404(Comment,pk=pk)
    comment.approve()

    return redirect('post_detail',pk=comment.post.pk)

@login_required
def comment_remove(request,pk):
    comment=get_object_or_404(Comment,pk=pk)
    post_pk=comment.post.pk
    comment.delete()
    return redirect('post_detail',pk=post_pk)

@login_required
def post_publish(request,pk):
    post=get_object_or_404(Post,pk=pk)
    post.publish()

    return redirect('post_detail',pk=pk)
