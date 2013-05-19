
#define V8_CLASS_BEGIN(ClassName)					\
  void ClassName::Init(v8::Handle<v8::Object> target)			\
  {									\
  v8::Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(New); \
  tpl->SetClassName(v8::String::NewSymbol( #ClassName ));		\
  tpl->InstanceTemplate()->SetInternalFieldCount(1);			\
  s_constructor = v8::Persistent<v8::Function>::New(tpl->GetFunction()); \
  target->Set(v8::String::NewSymbol( #ClassName ), s_constructor);	\

#define V8_CLASS_FUNCTION(FunctionName)					\
  tpl->PrototypeTemplate()->Set(v8::String::NewSymbol( #FunctionName ), \
				v8::FunctionTemplate::New(FunctionName)->GetFunction());

#define V8_CLASS_END				\
  }

#define V8_CLASS_NEW(ClassName)						\
  v8::Handle<v8::Value> ClassName::New(v8::Arguments const& args)	\
  {									\
    v8::HandleScope scope;						\
									\
    ClassName* obj = 0;							\
    try									\
      {									\
	obj = new ClassName();						\
      }									\
    catch (std::exception const& error)						\
      {									\
	v8::ThrowException(v8::Exception::Error(v8::String::New(error.what()))); \
      }									\
									\
    obj->Wrap(args.This());						\
									\
    return args.This();							\
  }
