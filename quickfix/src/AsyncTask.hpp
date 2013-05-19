#pragma once

#include <uv.h>
#include <v8.h>

#include <string>
#include <iostream>
#include <exception>

template<class T>
class AsyncTask
{
public:
  AsyncTask(v8::Persistent<v8::Function> const& callback_)
    : callback(callback_)
  {
    request.data = this;
  }

  void Queue(uv_loop_t* loop)
  {
    uv_queue_work(loop, &request, _Callback, _CallbackAfter);
  }

private:
  static void _Callback(uv_work_t* request)
  {
    T* self = static_cast<T*>(request->data);
    try
      {
	self->Callback();
      }
    catch (std::exception const& error)
      {
	self->errorMessage = error.what();
      }
  }

  static void _CallbackAfter(uv_work_t* request, int status)
  {
    T* self = static_cast<T*>(request->data);
    try
      {
	self->CallbackAfter();
      }
    catch (std::exception const& error)
      {
	self->errorMessage = error.what();
      }
    self->callback.Dispose();
    delete self;
  }

private:
  uv_work_t request;
  
protected:
  bool Succeeded() const
  {
    return errorMessage.empty();
  }

  std::string errorMessage;
  v8::Persistent<v8::Function> callback;
};
