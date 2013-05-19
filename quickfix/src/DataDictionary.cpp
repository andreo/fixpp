
#include "stdafx.h"

#include "DataDictionary.hpp"
#include "AsyncTask.hpp"
#include "ObjectBuilder.hpp"

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

void DataDictionary::Init(Handle<Object> target)
{
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("DataDictionary"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  tpl->PrototypeTemplate()->Set(String::NewSymbol("parseMessage"),
				FunctionTemplate::New(parseMessage)->GetFunction());

  s_constructor = Persistent<Function>::New(tpl->GetFunction());

  target->Set(String::NewSymbol("loadDictionary"),
	      FunctionTemplate::New(loadDictionary)->GetFunction());
}

Handle<Value> DataDictionary::New(Arguments const& args)
{
  HandleScope scope;
  DataDictionary* obj = new DataDictionary();
  obj->Wrap(args.This());
  return args.This();
}

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

Handle<Value> DataDictionary::parseMessage(Arguments const& args)
{
  HandleScope scope;

  String::AsciiValue message(args[0]->ToString());
  DataDictionary* obj = ObjectWrap::Unwrap<DataDictionary>(args.This());
  FIX::Message msg;
  try
    {
      msg.setString(*message, true, &obj->m_dataDictionary);
    }
  catch (FIX::Exception const& error)
    {
      ThrowException(Exception::Error(String::New(error.what())));
    }

  ObjectBuilder builder(&obj->m_dataDictionary);

  return scope.Close(builder(msg));
}
