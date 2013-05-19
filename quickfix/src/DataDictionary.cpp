
#include "stdafx.h"

#include "DataDictionary.hpp"
#include "AsyncTask.hpp"
#include "ObjectBuilder.hpp"
#include "v8util.hpp"

#include <quickfix/Message.h>
#include <uv.h>

using namespace v8;

class AsyncLoad : public AsyncTask<AsyncLoad>
{
public:
  AsyncLoad(FIX::DataDictionary* dict_,
	    std::string const& url_,
	    Persistent<Object> obj_,
	    Persistent<Function> const& callback)
    : AsyncTask<AsyncLoad>(callback)
    , dict(dict_)
    , url(url_)
    , obj(obj_)
  {}

public:
  void Callback()
  {
    dict->readFromURL(url);
  }

  void CallbackAfter()
  {
    if (Succeeded())
      {
	Handle<Value> argv[] = { Undefined(), obj };
	callback->Call(Context::GetCurrent()->Global(), 2, argv);
      }
    else
      {
	obj.Dispose();
	Handle<Value> argv[] = { String::New(errorMessage.c_str()), Undefined() };
	callback->Call(Context::GetCurrent()->Global(), 2, argv);
      }
  }

private:
  FIX::DataDictionary* dict;
  std::string const url;
  Persistent<Object> obj;
};

Persistent<Function> DataDictionary::s_constructor;

DataDictionary::DataDictionary()
  : m_dataDictionary()
{}

DataDictionary::~DataDictionary()
{}

V8_CLASS_BEGIN(DataDictionary)
V8_CLASS_FUNCTION(loadDictionary)
V8_CLASS_END
V8_CLASS_NEW(DataDictionary)

Handle<Value> DataDictionary::loadDictionary(Arguments const& args)
{
  HandleScope scope;

  String::AsciiValue
    fieldName(args[0]->ToString());
  Handle<Function>
    callback = Handle<Function>::Cast(args[1]);

  Local<Object> instance = s_constructor->NewInstance();
  DataDictionary* obj = ObjectWrap::Unwrap<DataDictionary>(instance);

  AsyncLoad* asyncLoad = new AsyncLoad(&obj->m_dataDictionary,
				       std::string(*fieldName),
				       Persistent<Object>::New(instance),
				       Persistent<Function>::New(callback));

  asyncLoad->Queue(uv_default_loop());

  return scope.Close(Undefined());
}
