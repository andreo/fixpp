
#include "stdafx.h"

#include "ObjectBuilder.hpp"

#include <quickfix/DataDictionary.h>
#include <quickfix/Message.h>
#include <quickfix/FieldMap.h>
#include <string>
#include <iostream>

using namespace v8;

ObjectBuilder::ObjectBuilder(FIX::DataDictionary* dataDictionary)
  : m_dataDictionary(dataDictionary)
{}

void ObjectBuilder::setAttribute(Handle<Object>& obj,
				 std::string const& name,
				 Handle<Value> const& value) const
{
  obj->Set(String::New(name.c_str(), name.size()), value);
}

void ObjectBuilder::setAttribute(Handle<Object>& obj,
				 std::string const& name,
				 std::string const& value) const
{
  setAttribute(obj, name, String::New(value.c_str(), value.size()));
}

void ObjectBuilder::setAttribute(Handle<Object>& obj,
				 std::string const& name,
				 int value) const
{
  setAttribute(obj, name, Integer::New(value));
}

Handle<Object> ObjectBuilder::makeField(int field, std::string const& value) const
{
  HandleScope scope;

  Local<Object> objField = Object::New();
  setAttribute(objField, "field", field);

  std::string buffer;
  if(m_dataDictionary && m_dataDictionary->getFieldName(field, buffer))
    {
      setAttribute(objField, "name", buffer);
    }
  if(m_dataDictionary && m_dataDictionary->getValueName(field, value, buffer))
    {
      setAttribute(objField, "enum", buffer);
    }
  setAttribute(objField, "value", value);
  
  return scope.Close(objField);
}

Handle<Array> ObjectBuilder::makeFieldList(FIX::FieldMap const& fields) const
{
  HandleScope scope;

  Local<Array> list = Array::New();
  int i = 0;
  FIX::FieldMap::iterator
    it = fields.begin(),
    end = fields.end();
  for (; it != end; ++it)
    {
      list->Set(Integer::New(i),
		makeField(it->first, it->second.getString()));
      ++i;
    }

  return scope.Close(list);
}

Handle<Array> ObjectBuilder::makeGroupList(FIX::FieldMap const& fields) const
{
  HandleScope scope;

  Local<Array> list = Array::New();
  int i = 0;
  FIX::FieldMap::g_iterator
    it = fields.g_begin(),
    end = fields.g_end();
  for (; it != end; ++it)
    {
      std::string groupName;
      if (m_dataDictionary) {
        m_dataDictionary->getFieldName(it->first, groupName);
      }
      std::vector<FIX::FieldMap*>::const_iterator
	k = it->second.begin(),
	kend = it->second.end();
      for (; k != kend; ++k)
	{
	  list->Set(Integer::New(i), makeFieldMap(**k, it->first, groupName));
	  ++i;
	}
    }
  
  return scope.Close(list);
}

v8::Handle<v8::Object> ObjectBuilder::makeFieldMap(FIX::FieldMap const& fieldMap,
						   int groupField,
						   std::string const& groupName) const
{
  HandleScope scope;

  Local<Object> obj = Object::New();

  setAttribute(obj, "groupName", groupName);
  setAttribute(obj, "groupField", groupField);
  setAttribute(obj, "fields", makeFieldList(fieldMap));
  setAttribute(obj, "groups", makeGroupList(fieldMap));

  return scope.Close(obj);
}

Handle<Object> ObjectBuilder::makeMessage(FIX::Message const& msg) const
{
  HandleScope scope;

  Local<Object> obj = Object::New();

  setAttribute(obj, "header", makeFieldList(msg.getHeader()));
  setAttribute(obj, "body", makeFieldMap(msg, 0, "body"));
  setAttribute(obj, "trailer", makeFieldList(msg.getTrailer()));

  return scope.Close(obj);
}
