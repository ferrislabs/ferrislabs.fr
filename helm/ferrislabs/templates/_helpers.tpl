{{- define "ferrislabs.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ferrislabs.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- include "ferrislabs.name" . -}}
{{- end -}}
{{- end -}}

{{- define "ferrislabs.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ferrislabs.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ferrislabs.name" .root }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/component: {{ .app.name }}
{{- end -}}

{{- define "ferrislabs.labels" -}}
helm.sh/chart: {{ include "ferrislabs.chart" .root }}
{{ include "ferrislabs.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .root.Release.Service }}
{{- with .root.Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{- define "ferrislabs.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "ferrislabs.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}
